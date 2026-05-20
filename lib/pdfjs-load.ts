/**
 * Same-origin worker shipped from `/public/pdf.worker.min.mjs` (copied at `npm install`
 * by `scripts/copy-pdfjs-worker.mjs`). pdf.js requires `workerSrc` to be a string.
 */
export const PDFJS_WORKER_PUBLIC_PATH = '/pdf.worker.min.mjs';

/**
 * Loads pdf.js and assigns a reliable string `workerSrc` (never use raw `?url` imports:
 * Turbopack may emit non-string shapes and pdf.js throws `Invalid \`workerSrc\` type.`).
 */
export async function loadPdfJs() {
  const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist/legacy/build/pdf');
  GlobalWorkerOptions.workerSrc = PDFJS_WORKER_PUBLIC_PATH;
  return { getDocument, GlobalWorkerOptions };
}
