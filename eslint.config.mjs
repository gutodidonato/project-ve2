import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    '.next/**',
    'node_modules/**',
    '.superpowers/**',
    'assets-src/**',
    // The Salto 88 build (vendored three r128 and its loaders), produced by the lab, not authored here.
    'public/salto88/**',
    'out/**',
    'build/**',
    'playwright-report/**',
    'test-results/**',
    'next-env.d.ts',
  ]),
]);
