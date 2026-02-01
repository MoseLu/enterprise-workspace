import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';
import { resolve } from 'path';
import type { Plugin } from 'vite';
import { getViteAppConfig } from '../../configs/vite-app-config';
import { createBaseResolve } from '../../configs/vite/base.config';

const appDir = fileURLToPath(new URL('.', import.meta.url));

// 获取应用配置
const appConfig = getViteAppConfig('home-app');

// 移除替换插件，让图片正常打包到构建产物中

export default defineConfig({
  root: appDir,
  base: '/',
  publicDir: 'public',
  plugins: [
    vue(),
    // 图片和视频文件会正常打包到构建产物中，CDN 作为降级方案
  ],
  server: {
    port: appConfig.devPort,
    host: appConfig.devHost,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  resolve: createBaseResolve(appDir, 'home-app'),
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        silenceDeprecations: ['legacy-js-api', 'import'],
      },
    },
  },
});
