import { type Options, defineConfig } from 'tsup';

const commonOpts: Options = {
  splitting: true,
  clean: true,
  format: ['esm'],
  treeshake: true,
  dts: true,
  sourcemap: 'inline',
  target: 'esnext',
  shims: true,
};

export default defineConfig([
  {
    entry: ['src/index.ts'],
    ...commonOpts,
  },
  {
    entry: ['src/sag/index.ts'],
    outDir: 'dist/sag',
    ...commonOpts,
  },
]);
