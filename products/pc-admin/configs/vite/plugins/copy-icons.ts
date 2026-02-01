/**
 * 复制 icons 目录插件
 * 用于在构建时复制 public/icons 目录到 dist/icons
 * 主要用于 admin-app，因为它需要显示图标内容
 */
// 注意：在 VitePress 配置加载时，不能直接导入 @btc/shared-core
// 使用 console 替代 logger
const logger = {
  warn: (...args: any[]) => console.warn('[copy-icons]', ...args),
  error: (...args: any[]) => console.error('[copy-icons]', ...args),
  info: (...args: any[]) => console.info('[copy-icons]', ...args),
  debug: (...args: any[]) => console.debug('[copy-icons]', ...args),
};

import type { Plugin, ResolvedConfig } from 'vite';
import { resolve } from 'path';
import { existsSync, copyFileSync, mkdirSync, readdirSync, statSync, writeFileSync, unlinkSync } from 'node:fs';

export function copyIconsPlugin(appDir: string): Plugin {
  let viteConfig: ResolvedConfig | null = null;

  return {
    name: 'copy-icons',
    apply: 'build', // 只在构建时执行

    configResolved(config: ResolvedConfig) {
      viteConfig = config;
    },

    closeBundle() {
      try {
        if (!viteConfig) {
          return;
        }

        const root = viteConfig.root || appDir;
        const iconsSourceDir = resolve(root, 'public/icons');

        // 检查源目录是否存在
        if (!existsSync(iconsSourceDir)) {
          return; // 如果源目录不存在，静默跳过
        }

        // 获取构建输出目录
        const outDir = viteConfig.build.outDir || 'dist';
        const distDir = resolve(root, outDir);

        if (!existsSync(distDir)) {
          return; // 如果输出目录不存在，跳过
        }

        const iconsDestDir = resolve(distDir, 'icons');

        // 确保目标目录存在
        if (!existsSync(iconsDestDir)) {
          mkdirSync(iconsDestDir, { recursive: true });
        }

        // 复制 icons 目录中的所有文件
        const files = readdirSync(iconsSourceDir);
        for (const file of files) {
          const sourcePath = resolve(iconsSourceDir, file);
          const destPath = resolve(iconsDestDir, file);

          const stats = statSync(sourcePath);
          if (stats.isFile()) {
            copyFileSync(sourcePath, destPath);
          }
        }

        // 不再复制 favicon.ico，统一使用 logo.png 作为 favicon
        // 如果构建产物中存在 favicon.ico，删除它（可能是 Vite 的 publicDir 复制的）
        const faviconDest = resolve(distDir, 'favicon.ico');
        if (existsSync(faviconDest)) {
          try {
            unlinkSync(faviconDest);
            console.info(`[copy-icons] 已删除不需要的 favicon.ico: ${faviconDest}`);
          } catch (error) {
            // 静默失败
          }
        }

        // 检查并复制 site.webmanifest（如果存在）
        const manifestSource = resolve(root, 'public/icons/site.webmanifest');
        const manifestDest = resolve(iconsDestDir, 'site.webmanifest');
        if (existsSync(manifestSource)) {
          copyFileSync(manifestSource, manifestDest);
        } else {
          // 如果不存在，尝试从 public 根目录复制
          const manifestSourceRoot = resolve(root, 'public/site.webmanifest');
          if (existsSync(manifestSourceRoot)) {
            copyFileSync(manifestSourceRoot, manifestDest);
          } else {
            // 如果都不存在，生成一个基本的 site.webmanifest
            const manifest = {
              name: 'BTC ShopFlow Admin',
              short_name: 'BTC Admin',
              description: 'BTC ShopFlow 管理应用',
              start_url: '/',
              display: 'standalone',
              background_color: '#ffffff',
              theme_color: '#404040',
              icons: [
                {
                  src: '/icons/android-chrome-192x192.png',
                  sizes: '192x192',
                  type: 'image/png',
                },
                {
                  src: '/icons/android-chrome-512x512.png',
                  sizes: '512x512',
                  type: 'image/png',
                },
                {
                  src: '/icons/favicon-32x32.png',
                  sizes: '32x32',
                  type: 'image/png',
                },
                {
                  src: '/icons/favicon-16x16.png',
                  sizes: '16x16',
                  type: 'image/png',
                },
              ],
            };
            writeFileSync(manifestDest, JSON.stringify(manifest, null, 2), 'utf-8');
          }
        }

        console.info(`[copy-icons] 已复制 icons 目录到: ${iconsDestDir}`);
      } catch (error) {
        // 静默失败，避免阻塞构建
        console.warn('[copy-icons] 复制 icons 目录失败:', error);
      }
    },
  } as Plugin;
}

