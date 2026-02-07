/**
 * Vitest 测试配置
 *
 * 配置单元测试和集成测试
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules/', 'dist/', 'dist-h5/', 'dist-weapp/'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
      exclude: [
        'node_modules/',
        'src/**/*.d.ts',
        'src/**/*.test.tsx',
        'src/**/*.spec.tsx',
        'src/main.tsx',
        'src/vite-env.d.ts',
      ],
    },
    setupFiles: ['./src/__tests__/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'apps'),
      '@enterprise-workspace/frontend': path.resolve(__dirname, '../common/frontend'),
    },
  },
});
