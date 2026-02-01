/**
 * 将 index.html 中的图标路径替换为 CDN URL 的 Vite 插件
 * 生产环境使用 CDN，开发/预览环境保持本地路径
 */
// 注意：在 VitePress 配置加载时，不能直接导入 @btc/shared-core
// 使用 console 替代 logger
const logger = {
  warn: (...args: any[]) => console.warn('[replace-icons-with-cdn]', ...args),
  error: (...args: any[]) => console.error('[replace-icons-with-cdn]', ...args),
  info: (...args: any[]) => console.info('[replace-icons-with-cdn]', ...args),
  debug: (...args: any[]) => console.debug('[replace-icons-with-cdn]', ...args),
};

import type { Plugin, ResolvedConfig } from 'vite';

export function replaceIconsWithCdnPlugin(): Plugin {
  let isProductionBuild = false;
  let cachedLogoCdnOk: boolean | null = null;

  return {
    name: 'replace-icons-with-cdn',
    apply: 'build', // 只在构建时执行

    configResolved(config: ResolvedConfig) {
      isProductionBuild = !!config.isProduction;
    },

    async transformIndexHtml(html) {
      // 只在生产环境构建时替换（使用 Vite 的 isProduction，避免 CI 环境变量不一致）
      if (!isProductionBuild) {
        return html;
      }

      try {
        // 延迟导入，避免在 vite.config.ts 加载时解析失败
        const { getEnvConfig } = await import('@btc/shared-core/configs/unified-env-config');
        // 获取环境配置
        const envConfig = getEnvConfig();
        const cdnUrl = envConfig.cdn?.staticAssetsUrl;

        if (!cdnUrl) {
          // 未配置 CDN，保持原样
          return html;
        }

        const cdnBase = cdnUrl.replace(/\/$/, '');

        // 关键：仅当 CDN 上确实存在 logo.png 时才替换
        // 否则保留本地 /logo.png，并依赖子应用 dist/logo.png 作为后备，避免 404
        if (cachedLogoCdnOk === null) {
          try {
            const res = await fetch(`${cdnBase}/logo.png`, { method: 'HEAD', redirect: 'follow' });
            cachedLogoCdnOk = !!res.ok;
          } catch {
            cachedLogoCdnOk = false;
          }
        }

        // 替换图标路径
        let newHtml = html;

        // 替换 /logo.png
        if (cachedLogoCdnOk) {
          newHtml = newHtml.replace(
            /href=["']\/logo\.png["']/g,
            `href="${cdnBase}/logo.png"`
          );
        }

        // 替换 /icons/ 路径
        newHtml = newHtml.replace(
          /href=["']\/icons\/([^"']+)["']/g,
          (match, iconFile) => {
            // 关键：site.webmanifest 必须保持同源（由各子应用自身提供），否则：
            // - 会触发跨域/CORS
            // - PWA start_url 会以 CDN 域名为基准，导致安装/启动行为错误
            if (iconFile === 'site.webmanifest') {
              return match;
            }
            return `href="${cdnBase}/icons/${iconFile}"`;
          }
        );

        return newHtml;
      } catch (error) {
        // 如果获取配置失败，保持原样
        console.warn('[replace-icons-with-cdn] 获取配置失败，保持原图标路径:', error);
        return html;
      }
    },
  } as Plugin;
}

