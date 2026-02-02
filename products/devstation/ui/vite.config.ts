import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@api': path.resolve(__dirname, './src/api'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@store': path.resolve(__dirname, './src/store'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@styles': path.resolve(__dirname, './src/styles'),
      // Design System 别名（统一设计语言）
      '@ds': path.resolve(__dirname, './common/design-system'),
      '@ds/components': path.resolve(__dirname, './common/design-system/components'),
      '@ds/tokens': path.resolve(__dirname, './common/design-system/tokens'),
      '@ds/hooks': path.resolve(__dirname, './common/design-system/hooks'),
      '@ds/utils': path.resolve(__dirname, './common/design-system/utils'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
