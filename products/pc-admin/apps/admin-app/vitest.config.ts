import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@modules': path.resolve(__dirname, 'src/modules'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@btc/shared-core': path.resolve(__dirname, '../../packages/shared-core/src'),
      '@btc/shared-components': path.resolve(__dirname, '../../packages/shared-components/src'),
      '@btc/shared-utils': path.resolve(__dirname, '../../packages/shared-utils/src')
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/unit/**/*.spec.ts'],
    setupFiles: ['tests/setup/unit.ts'],
    css: true,
    coverage: {
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage/unit'
    }
  }
});

