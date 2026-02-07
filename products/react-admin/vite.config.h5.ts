/**
 * Vite H5 构建配置
 *
 * 用于 H5 平台输出，兼容移动端浏览器
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'apps'),
      '@enterprise-workspace/frontend': path.resolve(__dirname, '../common/frontend'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  build: {
    outDir: 'dist-h5',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'antd': ['antd'],
          'vendor': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  define: {
    // Taro 运行时变量
    'process.env.TARO_ENV': JSON.stringify('h5'),
  },
});
