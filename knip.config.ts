import type { KnipConfig } from 'knip';

/**
 * WASM JS + service worker load at runtime (not TS imports).
 * Dropdown re-exports match Radix/shadcn conventions; callers use a subset only.
 */
const config: KnipConfig = {
  ignore: ['public/wasm/**/*.js', 'public/wasm-cache-sw.js'],
  ignoreIssues: {
    'components/ui/dropdown-menu.tsx': ['exports'],
  },
};

export default config;
