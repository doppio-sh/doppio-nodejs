import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitest/config';

const { version } = JSON.parse(readFileSync('package.json', 'utf8'));

export default defineConfig({
  define: { __SDK_VERSION__: JSON.stringify(version) },
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
        extends: true,
        test: {
          name: 'unit',
          include: ['test/*.test.ts'],
          unstubGlobals: true,
        },
      },
      {
        extends: true,
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
