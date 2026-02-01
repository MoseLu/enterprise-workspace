import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  {
    test: {
      include: ['packages/**/src/**/*.test.ts', 'packages/**/src/**/*.spec.ts'],
      name: 'packages',
      globals: true,
      environment: 'node',
    },
  },
  {
    test: {
      include: ['apps/**/src/**/*.test.{ts,tsx}', 'apps/**/src/**/*.spec.{ts,tsx}'],
      name: 'apps',
      globals: true,
      environment: 'jsdom',
    },
  },
]);

