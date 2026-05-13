import nextVitals from 'eslint-config-next/core-web-vitals';

const eslintConfig = [
  ...nextVitals,
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'build/**',
      'test-results/**',
      'playwright-report/**',
      'public/wasm/**',
      'next-env.d.ts',
    ],
  },
];

export default eslintConfig;
