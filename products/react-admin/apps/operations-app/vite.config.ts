import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@enterprise-workspace/frontend': path.resolve(
        __dirname,
        '../../../common/frontend'
      ),
    },
  },
  server: {
    port: 3002,
    open: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
