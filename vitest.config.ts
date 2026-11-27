import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90,
      },
    },
    projects: [
      {
        test: {
          name: 'unit',
          include: ['test/*.test.ts'],
          unstubGlobals: true,
        },
      },
      {
        test: {
          name: 'e2e',
          include: ['test/e2e/*.e2e.test.ts'],
          setupFiles: ['test/e2e/setup.ts'],
          testTimeout: 30_000,
        },
      },
    ],
  },
});
