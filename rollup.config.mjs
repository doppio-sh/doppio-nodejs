import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default [
  {
    input: 'lib/index.ts',
    output: {
      exports: 'named',
      file: 'dist/cjs/doppio.js',
      format: 'cjs',
      sourcemap: false,
    },
    plugins: [
      typescript({
        compilerOptions: {
          declaration: false,
          declarationMap: false,
          outDir: 'dist/cjs',
        },
      }),
      nodeResolve(),
      terser({
        keep_classnames: true,
        keep_fnames: true,
      }),
    ],
  },
  {
    input: 'lib/index.ts',
    output: {
      exports: 'named',
      file: 'dist/esm/doppio.mjs',
      format: 'es',
      sourcemap: false,
    },
    plugins: [
      typescript({
        compilerOptions: {
          declaration: false,
          declarationMap: false,
          outDir: 'dist/esm',
        },
      }),
      nodeResolve(),
      terser({
        keep_classnames: true,
        keep_fnames: true,
      }),
    ],
  },
];
