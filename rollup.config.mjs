/**
 * @type {import('rollup').RollupOptions}
 */
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import typescript from 'rollup-plugin-typescript2';
import json from '@rollup/plugin-json';
import { optimizeLodashImports } from "@optimize-lodash/rollup-plugin";

const devMode = process.env.NODE_ENV === 'development';
import packageJson from './package.json' assert { type: "json" };

const plugins  = [
    json(),
    peerDepsExternal(),
    nodeResolve({
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    }),
    typescript({
      exclude: ['*.d.ts', '**/*.d.ts', '**/*.stories.tsx', '**/*.spec.tsx'],
      clean: true,
    }),
    commonjs({
      ignoreGlobal: true,
      include: /\/node_modules\//,
    }),
  ];

  const external = ['react', 'lodash-es', 'lodash', 'use-delayed-render','fast-deep-equal'];



const createRollupConfig = [
  {
  input: 'src/index.ts',
  output: [
    {
      file: packageJson.module,
      format: 'cjs',
      sourcemap: devMode ? 'inline' : false,
    },
  ],
  external,
  plugins: [...plugins],
},
{
  input: 'src/index.ts',
  output: [
    {
      file: packageJson.main,
      format: 'esm',
      sourcemap: devMode ? 'inline' : false,
    },
  ],
  plugins: [...plugins],
  external,

},

];

export default createRollupConfig;
