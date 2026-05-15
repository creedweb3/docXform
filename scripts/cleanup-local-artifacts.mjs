/**
 * Remove local/generated artifacts that should not be committed.
 * Safe to run repeatedly.
 */
import { existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const targets = [
  '.next',
  'out',
  'playwright-report',
  'test-results',
  'tmp-conversion-tests',
  'coverage',
  'tsconfig.tsbuildinfo',
];

let removed = 0;
for (const rel of targets) {
  const abs = resolve(repoRoot, rel);
  if (!existsSync(abs)) continue;
  rmSync(abs, { recursive: true, force: true });
  console.log(`removed ${rel}`);
  removed += 1;
}

if (removed === 0) {
  console.log('nothing to clean');
}
