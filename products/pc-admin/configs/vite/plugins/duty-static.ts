/**
 * Duty 静态文件插件
 * 在开发服务器层面拦截 /duty/ 路径，直接返回 public 目录下的静态 HTML 文件
 * 避免这些文件被 Vue Router 处理
 * 在构建时，将 public 目录下的 HTML、CSS、JS 文件复制到 dist/duty/ 目录
 */
// 注意：在 VitePress 配置加载时，不能直接导入 @btc/shared-core
// 使用 console 替代 logger
const logger = {
  warn: (...args: any[]) => console.warn('[duty-static]', ...args),
  error: (...args: any[]) => console.error('[duty-static]', ...args),
  info: (...args: any[]) => console.info('[duty-static]', ...args),
  debug: (...args: any[]) => console.debug('[duty-static]', ...args),
};

import type { Plugin, ViteDevServer } from 'vite';
import type { ResolvedConfig } from 'vite';
import { readFileSync, existsSync, readdirSync, statSync, copyFileSync, mkdirSync, writeFileSync } from 'fs';
import { join, resolve, extname } from 'path';

/**
 * Duty 静态文件插件
 * @param appDir 应用目录路径
 */
export function dutyStaticPlugin(appDir: string): Plugin {
  let viteConfig: ResolvedConfig | null = null;

  const dutyMiddleware = (req: any, res: any, next: any) => {
    // 只处理 /duty/ 路径的请求
    if (!req.url || !req.url.startsWith('/duty/')) {
      next();
      return;
    }

    // 提取文件名，例如 /duty/agreement.html -> agreement.html
    const fileName = req.url.replace('/duty/', '');

    // 构建文件路径：public 目录下的文件
    const publicDir = resolve(appDir, 'public');
    const filePath = join(publicDir, fileName);

    // 检查文件是否存在
    if (!existsSync(filePath)) {
      // 文件不存在，继续下一个中间件（可能会被 Vue Router 处理或返回 404）
      next();
      return;
    }

    // 读取文件内容
    try {
      const fileContent = readFileSync(filePath, 'utf-8');

      // 设置正确的 Content-Type
      if (fileName.endsWith('.html')) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
      } else if (fileName.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
      } else if (fileName.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      }

      // 返回文件内容
      res.statusCode = 200;
      res.end(fileContent);
    } catch (error) {
      // 读取文件失败，继续下一个中间件
      console.error('[duty-static] 读取文件失败:', filePath, error);
      next();
    }
  };

  return {
    name: 'duty-static',
    enforce: 'pre', // 在其他插件之前执行，确保在 Vue Router 之前处理
    configResolved(config: ResolvedConfig) {
      viteConfig = config;
    },
    configureServer(server: ViteDevServer) {
      // 使用 use 添加中间件，由于 enforce: 'pre'，这会在 Vue 插件之前执行
      server.middlewares.use(dutyMiddleware);
    },
    configurePreviewServer(server: ViteDevServer) {
      // 预览服务器也使用相同的逻辑
      server.middlewares.use(dutyMiddleware);
    },
    writeBundle() {
      // 构建时，将 public 目录下的 HTML、CSS、JS 文件复制到 dist/duty/ 目录
      if (!viteConfig) {
        return;
      }

      const publicDir = resolve(appDir, 'public');
      if (!existsSync(publicDir)) {
        return;
      }

      const outDir = viteConfig.build.outDir || 'dist';
      const distDir = resolve(appDir, outDir);
      if (!existsSync(distDir)) {
        return;
      }

      const dutyDir = resolve(distDir, 'duty');
      if (!existsSync(dutyDir)) {
        mkdirSync(dutyDir, { recursive: true });
      }

      // 需要复制的文件类型（排除图片，图片由 publicImagesToAssetsPlugin 处理）
      const dutyFileExtensions = ['.html', '.css', '.js'];
      // 排除的文件列表（图片文件由其他插件处理）
      const excludedFiles = ['logo.png', 'login_cut_dark.png', 'login_cut_light.png', 'scan.png', 'favicon.ico'];

      // 自动检测 public 目录中的 jQuery 文件（优先使用 3.x 稳定版本）
      const files = readdirSync(publicDir);
      let jqueryFile: string | null = null;
      const jqueryFiles: string[] = [];

      // 收集所有 jQuery 文件
      for (const file of files) {
        if (file.startsWith('jquery') && file.endsWith('.min.js')) {
          jqueryFiles.push(file);
        }
      }

      // 优先选择 3.x 版本（稳定版），如果没有则选择第一个
      if (jqueryFiles.length > 0) {
        const stableVersion = jqueryFiles.find(f => f.includes('jquery-3.'));
        jqueryFile = (stableVersion || jqueryFiles[0]) ?? null;
        if (jqueryFiles.length > 1) {
          console.info(`[duty-static] 📋 找到多个 jQuery 文件: ${jqueryFiles.join(', ')}`);
          console.info(`[duty-static] 📌 使用: ${jqueryFile}`);
        }
      }

      // 复制 jQuery 文件（如果存在）
      if (jqueryFile) {
        const jquerySourcePath = resolve(publicDir, jqueryFile);
        const jqueryDestPath = resolve(dutyDir, jqueryFile);
        try {
          copyFileSync(jquerySourcePath, jqueryDestPath);
          console.info(`[duty-static] 📦 已复制 ${jqueryFile} 到 dist/duty/`);
        } catch (error) {
          console.error(`[duty-static] ⚠️  复制 jQuery 文件失败:`, error);
        }
      } else {
        console.warn(`[duty-static] ⚠️  警告: 未找到 jQuery 文件（jquery*.min.js）在 public 目录`);
      }

      let copiedCount = 0;

      // 再次读取文件列表，用于复制其他文件（不包括jQuery，因为已经复制过了）
      for (const file of files) {
        // 跳过排除的文件
        if (excludedFiles.includes(file)) {
          continue;
        }

        // 跳过 jQuery 文件（已经在上面单独处理了）
        if (jqueryFile && file === jqueryFile) {
          continue;
        }

        const ext = extname(file).toLowerCase();
        if (dutyFileExtensions.includes(ext)) {
          const sourcePath = resolve(publicDir, file);
          const destPath = resolve(dutyDir, file);

          try {
            const stats = statSync(sourcePath);
            if (stats.isFile()) {
              // 对于HTML文件，需要替换其中的CSS和JS路径
              if (ext === '.html') {
                let content = readFileSync(sourcePath, 'utf-8');
                // 替换 jQuery CDN 路径为本地路径（支持任意版本的jQuery CDN链接）
                if (jqueryFile) {
                  // 替换各种可能的 jQuery CDN 链接格式
                  content = content.replace(
                    /https:\/\/code\.jquery\.com\/jquery-[^"'\s]+\.min\.js/g,
                    `/duty/${jqueryFile}`
                  );
                  // 也替换其他可能的 CDN 链接格式
                  content = content.replace(
                    /https?:\/\/[^"'\s]*jquery[^"'\s]*\.min\.js/g,
                    `/duty/${jqueryFile}`
                  );
                }
                // 替换 CSS 路径：/index.css -> /duty/index.css
                content = content.replace(/href=["']\/index\.css["']/g, 'href="/duty/index.css"');
                // 替换 JS 路径：/index.js -> /duty/index.js
                content = content.replace(/src=["']\/index\.js["']/g, 'src="/duty/index.js"');
                // 替换 logo 路径：/logo.png -> /logo.png (保持根路径，因为logo在根目录)
                // logo.png 由 publicImagesToAssetsPlugin 处理，保持在根目录，所以不需要修改
                writeFileSync(destPath, content, 'utf-8');
              } else {
                // CSS 和 JS 文件直接复制
                copyFileSync(sourcePath, destPath);
              }
              copiedCount++;
              console.info(`[duty-static] 📦 已复制 ${file} 到 dist/duty/`);
            }
          } catch (error) {
            console.error(`[duty-static] ⚠️  复制文件失败 ${file}:`, error);
          }
        }
      }

      if (copiedCount > 0) {
        console.info(`[duty-static] ✅ 构建完成：已复制 ${copiedCount} 个文件到 dist/duty/`);
      }
    },
  } as Plugin;
}
