import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const pkgRoot = dirname(require.resolve('@matbee/libreoffice-converter/package.json'));
const browserJs = join(pkgRoot, 'dist', 'browser.js');

const FROM = 'e(new Error("Worker load timeout")),1e4';
const TO = 'e(new Error("Worker load timeout")),12e4';

const source = readFileSync(browserJs, 'utf8');
if (!source.includes(FROM)) {
  if (source.includes(TO)) {
    console.log('patch-matbee-worker-timeout: already patched');
    process.exit(0);
  }
  console.error('patch-matbee-worker-timeout: pattern not found — check @matbee/libreoffice-converter version');
  process.exit(1);
}

writeFileSync(browserJs, source.replace(FROM, TO));
console.log('patch-matbee-worker-timeout: worker ready timeout 10s → 120s');
