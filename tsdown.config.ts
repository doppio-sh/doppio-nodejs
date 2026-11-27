import { readFileSync } from 'node:fs';
import { defineConfig } from 'tsdown';

const { version } = JSON.parse(readFileSync('package.json', 'utf8'));

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  platform: 'neutral',
  target: 'es2023',
  fixedExtension: true,
  dts: true,
  sourcemap: true,
  define: { __SDK_VERSION__: JSON.stringify(version) },
});
