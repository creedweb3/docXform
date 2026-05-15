/**
 * Copy pdf.js worker into /public so `GlobalWorkerOptions.workerSrc` can be a plain
 * same-origin string. Turbopack's `?url` default export is not always a string (pdf.js
 * throws "Invalid `workerSrc` type."), and `new URL(..., import.meta.url)` can resolve
 * to a non-loading URL inside app chunks.
 */
import { copyFile, mkdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const src = join(root, 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.min.mjs');
const destDir = join(root, 'public');
const dest = join(destDir, 'pdf.worker.min.mjs');

try {
  await stat(src);
} catch {
  console.warn('[copy-pdfjs-worker] skipped: node_modules/pdfjs-dist not found');
  process.exit(0);
}

await mkdir(destDir, { recursive: true });
await copyFile(src, dest);
console.log('[copy-pdfjs-worker] public/pdf.worker.min.mjs');
