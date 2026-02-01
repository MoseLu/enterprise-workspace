/**
 * CORS 插件
 * 支持 credentials 的 CORS 中间件
 */

import type { Plugin, ViteDevServer } from 'vite';

/**
 * CORS 插件（支持 credentials）
 */
export function corsPlugin(): Plugin {
  const corsDevMiddleware = (req: any, res: any, next: any) => {
    const origin = req.headers.origin;

    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id');
      res.setHeader('Access-Control-Allow-Private-Network', 'true');
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id');
      res.setHeader('Access-Control-Allow-Private-Network', 'true');
    }

    if (req.method === 'OPTIONS') {
      res.statusCode = 200;
      res.setHeader('Access-Control-Max-Age', '86400');
      res.setHeader('Content-Length', '0');
      res.end();
      return;
    }

    next();
  };

  const corsPreviewMiddleware = (req: any, res: any, next: any) => {
    if (req.method === 'OPTIONS') {
      const origin = req.headers.origin;

      if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id');
      } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id');
      }

      res.statusCode = 200;
      res.setHeader('Access-Control-Max-Age', '86400');
      res.setHeader('Content-Length', '0');
      res.end();
      return;
    }

    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id');
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id');
    }

    next();
  };

  return {
    name: 'cors-with-credentials',
    enforce: 'pre',
    configureServer(server: ViteDevServer) {
      const stack = (server.middlewares as any).stack;
      if (Array.isArray(stack)) {
        const filteredStack = stack.filter((item: any) =>
          item.handle !== corsDevMiddleware && item.handle !== corsPreviewMiddleware
        );
        (server.middlewares as any).stack = [
          { route: '', handle: corsDevMiddleware },
          ...filteredStack,
        ];
      } else {
        server.middlewares.use(corsDevMiddleware);
      }
    },
    configurePreviewServer(server: ViteDevServer) {
      const stack = (server.middlewares as any).stack;
      if (Array.isArray(stack)) {
        const filteredStack = stack.filter((item: any) =>
          item.handle !== corsDevMiddleware && item.handle !== corsPreviewMiddleware
        );
        (server.middlewares as any).stack = [
          { route: '', handle: corsPreviewMiddleware },
          ...filteredStack,
        ];
      } else {
        server.middlewares.use(corsPreviewMiddleware);
      }
    },
  } as Plugin;
}

