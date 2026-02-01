/**
 * Locales 静态文件插件
 * 在开发服务器层面提供 src/locales/*.json 文件，供主应用通过 fetch 加载
 */
// 注意：在 VitePress 配置加载时，不能直接导入 @btc/shared-core
// 因为 esbuild 无法正确解析 workspace 包
// 使用 console 替代 logger，避免配置加载时的解析问题

import type { Plugin, ViteDevServer } from 'vite';
import type { ResolvedConfig } from 'vite';
import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';

// 使用 console 作为 logger，避免在配置加载时解析 @btc/shared-core
const logger = {
  warn: (...args: any[]) => console.warn('[locales-static]', ...args),
  error: (...args: any[]) => console.error('[locales-static]', ...args),
  info: (...args: any[]) => console.info('[locales-static]', ...args),
  debug: (...args: any[]) => console.debug('[locales-static]', ...args),
};

/**
 * Locales 静态文件插件
 * @param appDir 应用目录路径
 */
export function localesStaticPlugin(appDir: string): Plugin {
  let viteConfig: ResolvedConfig | null = null;

  const localesMiddleware = (req: any, res: any, next: any) => {
    // 处理 OPTIONS 预检请求
    if (req.method === 'OPTIONS' && req.url?.match(/^\/src\/locales\/[^/]+\.json$/)) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.statusCode = 200;
      res.end();
      return;
    }

    // 只处理 GET 请求和 /src/locales/*.json 路径
    if (req.method !== 'GET' || !req.url || !req.url.match(/^\/src\/locales\/[^/]+\.json$/)) {
      next();
      return;
    }

    // 提取文件路径，例如 /src/locales/zh-CN.json -> src/locales/zh-CN.json
    const filePath = req.url.replace(/^\//, '');

    // 构建完整文件路径
    const fullPath = resolve(appDir, filePath);

    // 检查文件是否存在
    if (!existsSync(fullPath)) {
      // 文件不存在，记录警告并继续下一个中间件
      console.warn(`[locales-static] File not found: ${fullPath} (requested: ${req.url})`);
      next();
      return;
    }

    // 读取文件内容
    try {
      const content = readFileSync(fullPath, 'utf-8');

      // 设置响应头
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      // 返回文件内容
      res.statusCode = 200;
      res.end(content);
    } catch (error) {
      // 读取文件失败，继续下一个中间件
      console.warn(`[locales-static] Failed to read file: ${fullPath}`, error);
      next();
    }
  };

  return {
    name: 'vite-plugin-locales-static',

    configResolved(config) {
      viteConfig = config;
    },

    configureServer(server: ViteDevServer) {
      // 在 Vite 内部中间件之前拦截请求，提供 locales 文件
      // 使用 use 将中间件添加到中间件栈，Vite 会按照注册顺序执行
      // 我们需要在 SPA fallback 之前处理，所以直接使用 use
      server.middlewares.use(localesMiddleware);
    },
  };
}
