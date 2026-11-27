import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['test/*.test.ts'],
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
