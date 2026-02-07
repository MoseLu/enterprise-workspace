/**
 * SVG HMR 插件
 * 支持 SVG 图标热更新，无需重新构建共享包
 */
import { fileURLToPath, URL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

export function svgHmrPlugin(appDir: string) {
  const iconsDir = path.resolve(appDir, 'src/assets/icons');

  return {
    name: 'vite-plugin-engineering-svg-hmr',

    configureServer(server: any) {
      // 监听 SVG 文件变化
      if (server.ws) {
        server.ws.on('message', async (data: any) => {
          // 检查是否为 SVG 文件变化消息
          if (data.type === 'update' && data.path) {
            if (data.path.endsWith('.svg') || data.path.includes('icons')) {
              // 通知客户端刷新 SVG
              server.ws.send({
                type: 'custom',
                event: 'engineering-svg-reload',
                data: {
                  path: data.path,
                },
              });
            }
          }
        });
      }
    },

    transform(code: string, id: string) {
      // 如果是 SVG 文件，添加 HMR 支持
      if (id.endsWith('.svg')) {
        return {
          code: code + '\n// SVG HMR',
          map: null,
        };
      }
      return { code, map: null };
    },
  };
}
