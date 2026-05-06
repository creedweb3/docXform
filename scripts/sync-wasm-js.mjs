/**
 * Copy LibreOffice WASM *JavaScript* artifacts from @matbee/libreoffice-converter into public/wasm/.
 * Heavy .wasm / .data stay on CDN; these must be same-origin for workers and script loading.
 */
import { copyFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const pkgRoot = dirname(require.resolve('@matbee/libreoffice-converter/package.json'));
const repoRoot = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const outDir = join(repoRoot, 'public', 'wasm');

const copies = [
  [join(pkgRoot, 'dist', 'browser.worker.global.js'), join(outDir, 'browser.worker.global.js')],
  [join(pkgRoot, 'wasm', 'soffice.js'), join(outDir, 'soffice.js')],
  [join(pkgRoot, 'wasm', 'soffice.worker.js'), join(outDir, 'soffice.worker.js')],
];

mkdirSync(outDir, { recursive: true });
for (const [src, dest] of copies) {
  copyFileSync(src, dest);
}
console.log('sync-wasm-js: copied browser.worker.global.js, soffice.js, soffice.worker.js → public/wasm/');
