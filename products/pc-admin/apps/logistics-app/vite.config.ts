import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { createSubAppViteConfig } from '../../configs/vite/factories/subapp.config';
import { proxy as mainProxy } from '../admin-app/src/config/proxy';
import { copyLogoPlugin } from '@btc/vite-plugin';

export default defineConfig(
  createSubAppViteConfig({
    appName: 'logistics-app',
    appDir: fileURLToPath(new URL('.', import.meta.url)),
    qiankunName: 'logistics',
    customPlugins: [
      // 移除：不再需要复制 logo.png，统一使用 CDN
      // copyLogoPlugin(),
    ],
    customServer: { proxy: mainProxy },
    proxy: mainProxy,
  })
);
