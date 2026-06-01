/**
 * Same-origin worker shipped from `/public/pdf.worker.min.mjs` (copied at `npm install`
 * by `scripts/copy-pdfjs-worker.mjs`). pdf.js requires `workerSrc` to be a string.
 */
export const PDFJS_WORKER_PUBLIC_PATH = '/pdf.worker.min.mjs';

let workerSrcPromise: Promise<string> | null = null;

function resolvePdfWorkerPublicUrl(): string {
  if (typeof window === 'undefined') return PDFJS_WORKER_PUBLIC_PATH;
  return new URL(PDFJS_WORKER_PUBLIC_PATH, window.location.origin).href;
}

/**
 * Blob URL worker survives COOP/COEP + Turbopack dev better than a bare .mjs path.
 */
async function ensurePdfWorkerBlobUrl(): Promise<string> {
  if (typeof window === 'undefined') return PDFJS_WORKER_PUBLIC_PATH;
  if (workerSrcPromise) return workerSrcPromise;

  workerSrcPromise = (async () => {
    const url = resolvePdfWorkerPublicUrl();
    const res = await fetch(url, { cache: 'force-cache' });
    if (!res.ok) {
      throw new Error(
        `PDF.js worker not found (${res.status} at ${url}). Run: node scripts/copy-pdfjs-worker.mjs`
      );
    }
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  })();

  return workerSrcPromise;
}

/**
 * Loads pdf.js and assigns a reliable string `workerSrc` (never use raw `?url` imports:
 * Turbopack may emit non-string shapes and pdf.js throws `Invalid \`workerSrc\` type.`).
 */
export async function loadPdfJs() {
  const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist/legacy/build/pdf');
  GlobalWorkerOptions.workerSrc = await ensurePdfWorkerBlobUrl();
  return { getDocument, GlobalWorkerOptions };
}

/** @deprecated Use loadPdfJs — kept for call sites that probe reachability before open. */
export async function assertPdfJsWorkerReachable(): Promise<void> {
  await ensurePdfWorkerBlobUrl();
}
