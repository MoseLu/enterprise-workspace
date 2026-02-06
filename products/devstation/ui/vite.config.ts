import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { svgSpritePlugin } from './vite-plugins/svg-sprite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toPath = (p: string) => path.normalize(path.resolve(__dirname, p));

export default defineConfig({
  plugins: [
    react(),
    svgSpritePlugin(toPath('src/assets/icons')),
  ],
  resolve: {
    alias: [
      {
        find: '@enterprise-workspace/frontend/shared',
        replacement: path.resolve(__dirname, '../../../common/frontend/shared'),
      },
      {
        find: '@enterprise-workspace/frontend/tokens',
        replacement: path.resolve(__dirname, '../../../common/frontend/tokens'),
      },
      {
        find: '@',
        replacement: toPath('./src'),
      },
      {
        find: '@components',
        replacement: toPath('./src/components'),
      },
      {
        find: '@pages',
        replacement: toPath('./src/pages'),
      },
      {
        find: '@api',
        replacement: toPath('./src/api'),
      },
      {
        find: '@hooks',
        replacement: toPath('./src/hooks'),
      },
      {
        find: '@store',
        replacement: toPath('./src/store'),
      },
      {
        find: '@utils',
        replacement: toPath('./src/utils'),
      },
      {
        find: '@styles',
        replacement: toPath('./src/styles'),
      },
    ],
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  // 优化依赖解析
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand',
      'axios',
      'antd',
      '@ant-design/icons',
    ],
    exclude: [],
  },
  server: {
    host: '0.0.0.0',
    port: 8080,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:9001',
        changeOrigin: true,
      },
    },
  },
});
