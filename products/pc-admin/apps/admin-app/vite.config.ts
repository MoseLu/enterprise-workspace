import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { createSubAppViteConfig } from '../../configs/vite/factories/subapp.config';
import { copyIconsPlugin } from '../../configs/vite/plugins';
import { titleInjectPlugin } from './vite-plugin-title-inject';
import { proxy } from './src/config/proxy';

export default defineConfig(
  createSubAppViteConfig({
    appName: 'admin-app',
    appDir: fileURLToPath(new URL('.', import.meta.url)),
    qiankunName: 'admin',
    customPlugins: [
      titleInjectPlugin(),
      // 移除：不再需要复制 icons 目录，统一使用 CDN
      // copyIconsPlugin(fileURLToPath(new URL('.', import.meta.url))),
    ],
    customServer: { proxy },
    proxy,
  })
);
