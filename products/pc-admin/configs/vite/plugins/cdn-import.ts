/**
 * CDN 动态导入转换插件
 * 在构建时转换代码中的 import() 调用，将相对路径转换为 CDN URL
 * 与 cdnAssetsPlugin 配合，实现完整的 CDN 加速
 */
// 注意：在 VitePress 配置加载时，不能直接导入 @btc/shared-core
// 使用 console 替代 logger
const logger = {
  warn: (...args: any[]) => console.warn('[cdn-import]', ...args),
  error: (...args: any[]) => console.error('[cdn-import]', ...args),
  info: (...args: any[]) => console.info('[cdn-import]', ...args),
  debug: (...args: any[]) => console.debug('[cdn-import]', ...args),
};

import type { Plugin } from 'vite';

export interface CdnImportPluginOptions {
  /**
   * 应用名称（如 'logistics-app'）
   */
  appName: string;
  /**
   * 是否启用 CDN 加速（默认：生产环境启用）
   */
  enabled?: boolean;
  /**
   * CDN 域名（默认：all.bellis.com.cn）
   */
  cdnDomain?: string;
}

/**
 * CDN 动态导入转换插件
 */
export function cdnImportPlugin(options: CdnImportPluginOptions): Plugin {
  const {
    appName,
    // 关键：默认启用条件必须明确检查 ENABLE_CDN_ACCELERATION 环境变量
    // 如果 ENABLE_CDN_ACCELERATION 被设置为 'false'，则禁用 CDN
    // 只有在明确启用（ENABLE_CDN_ACCELERATION=true）或未设置且是生产构建时，才启用 CDN
    enabled = process.env.ENABLE_CDN_ACCELERATION === 'true' || 
              (process.env.ENABLE_CDN_ACCELERATION !== 'false' && 
               process.env.NODE_ENV === 'production' && 
               process.env.VITE_PREVIEW !== 'true'),
    cdnDomain = 'https://all.bellis.com.cn',
  } = options;

  return {
    name: 'cdn-import',
    apply: 'build',
    buildStart() {
      if (enabled) {
        console.info(`[cdn-import] CDN 动态导入转换已启用，应用: ${appName}, CDN 域名: ${cdnDomain}`);
      } else {
        console.info(`[cdn-import] CDN 动态导入转换已禁用`);
      }
    },
    renderChunk(code: string, chunk: any) {
      // 在 renderChunk 阶段处理构建后的代码
      // 此时 import() 调用已经被 Vite 转换为相对路径的 chunk 文件（如 ./index-xxx.js）
      if (!enabled) {
        return null;
      }

      // 只处理 JS chunk 文件
      if (!chunk.fileName.endsWith('.js')) {
        return null;
      }

      // 跳过入口文件（index-xxx.js），因为入口文件是通过 script 标签直接加载的，已在 HTML 中处理
      if (chunk.isEntry || chunk.fileName.match(/^index-[a-zA-Z0-9]+\.js$/)) {
        return null;
      }

      let modified = false;
      let newCode = code;

      // 匹配 import() 调用，识别相对路径的资源
      // 匹配模式：import('...') 或 import("...")
      const importPattern = /import\s*\(\s*(['"])([^'"]+)\1\s*\)/g;

      newCode = newCode.replace(importPattern, (match: string, quote: string, specifier: string) => {
        // 只处理相对路径（./xxx.js）和 /assets/ 路径
        // 绝对路径（http://、https://）和 node_modules 路径不处理
        const isRelativePath = specifier.startsWith('./');
        const isAssetsPath = specifier.startsWith('/assets/');
        
        if (!isRelativePath && !isAssetsPath) {
          return match; // 非相对路径且非 /assets/ 路径，保持原样
        }

        modified = true;

        // 规范化路径
        let normalizedPath: string;
        if (isRelativePath) {
          // 相对路径：./index-xxx.js -> /assets/index-xxx.js
          // 或者：./assets/xxx.js -> /assets/xxx.js
          if (specifier.startsWith('./assets/')) {
            normalizedPath = '/' + specifier.substring(2);
          } else {
            // Vite chunk 文件：./index-xxx.js -> /assets/index-xxx.js
            normalizedPath = '/assets/' + specifier.substring(2);
          }
        } else {
          // 已经是绝对路径 /assets/xxx.js
          normalizedPath = specifier;
        }

        // 判断是否是布局应用资源
        const isLayoutResource = normalizedPath.includes('/assets/layout/');

        // 生成 CDN URL
        let cdnUrl: string;
        if (isLayoutResource) {
          // 布局应用资源
          cdnUrl = `${cdnDomain}/layout-app${normalizedPath}`;
        } else {
          // 当前应用资源
          cdnUrl = `${cdnDomain}/${appName}${normalizedPath}`;
        }

        // 转换为 CDN URL
        return `import(${quote}${cdnUrl}${quote})`;
      });

      if (modified) {
        console.info(`[cdn-import] 已转换 chunk ${chunk.fileName} 中的动态导入为 CDN URL`);
      }

      return modified ? { code: newCode, map: null } : null;
    },
  } as Plugin;
}

