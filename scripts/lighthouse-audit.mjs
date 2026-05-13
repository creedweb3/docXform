/**
 * Lab Web Vitals / performance audit (Chromium + Lighthouse).
 *
 * Prerequisites: site reachable (e.g. `npm run dev` or deployed URL).
 *
 * Usage:
 *   node scripts/lighthouse-audit.mjs
 *   node scripts/lighthouse-audit.mjs https://www.docxform.com/word-to-pdf
 *
 * First run may download Lighthouse via npx. Optional: `npm i -D lighthouse` for offline use.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const outDir = join(repoRoot, 'tmp');
const target =
  process.argv[2] ||
  process.env.LIGHTHOUSE_URL ||
  process.env.PLAYWRIGHT_BASE_URL ||
  'http://localhost:3000/word-to-pdf';

mkdirSync(outDir, { recursive: true });
const outBase = join(outDir, 'lighthouse-report');

const localCli = join(repoRoot, 'node_modules', 'lighthouse', 'cli', 'index.js');
const useLocal = existsSync(localCli);

const commonArgs = [
  target,
  '--only-categories=performance',
  '--preset=desktop',
  '--output=json,html',
  `--output-path=${outBase}`,
  '--quiet',
  '--chrome-flags=--headless=new',
];

const cmd = useLocal ? process.execPath : process.platform === 'win32' ? 'npx.cmd' : 'npx';
const args = useLocal ? [localCli, ...commonArgs] : ['--yes', 'lighthouse@11.7.1', ...commonArgs];

const r = spawnSync(cmd, args, {
  cwd: repoRoot,
  stdio: 'inherit',
  shell: false,
});

if (r.status !== 0) {
  console.error('Lighthouse failed. Install locally: npm i -D lighthouse');
  process.exit(r.status ?? 1);
}

console.log(`\nReports: ${outBase}.report.html and .json under tmp/\n`);
