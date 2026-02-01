import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { createSubAppViteConfig } from '../../configs/vite/factories/subapp.config';
import { proxy as mainProxy } from '../admin-app/src/config/proxy';

export default defineConfig(
  createSubAppViteConfig({
    appName: 'quality-app',
    appDir: fileURLToPath(new URL('.', import.meta.url)),
    qiankunName: 'quality',
    customServer: { proxy: mainProxy },
    proxy: mainProxy,
  })
);
