import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { createSubAppViteConfig } from '../../configs/vite/factories/subapp.config';
import { proxy as mainProxy } from '../admin-app/src/config/proxy';

export default defineConfig(
  createSubAppViteConfig({
    appName: 'dashboard-app',
    appDir: fileURLToPath(new URL('.', import.meta.url)),
    qiankunName: 'dashboard',
    customServer: { proxy: mainProxy },
    proxy: mainProxy,
  })
);
