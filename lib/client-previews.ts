'use client';

import type { PDFDocumentProxy } from 'pdfjs-dist/legacy/build/pdf';

import { getPdfPageCount } from '@/lib/pdf-page-count';
import { assertPdfJsWorkerReachable, loadPdfJs } from '@/lib/pdfjs-load';

const PDF_PREVIEW_TIMEOUT_MS = 90_000;
const PDF_PAGE_RENDER_TIMEOUT_MS = 45_000;

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${Math.round(ms / 1000)}s`)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Fast metadata-only pass so page-grid / split studio can render before the
 * cover thumbnail finishes (or if cover render is slow).
 */
export async function probePdfPageCount(file: File): Promise<number> {
  if (typeof window === 'undefined') return 0;
  return withTimeout(getPdfPageCount(file), 60_000, 'PDF page count');
}

async function openPdfBytes(bytes: Uint8Array): Promise<PDFDocumentProxy> {
  await assertPdfJsWorkerReachable();
  const { getDocument } = await loadPdfJs();
  return withTimeout(
    getDocument({ data: bytes }).promise,
    PDF_PREVIEW_TIMEOUT_MS,
    'PDF open'
  );
}

async function openPdfFromFile(file: File): Promise<PDFDocumentProxy> {
  const arrayBuffer = await file.arrayBuffer();
  return openPdfBytes(new Uint8Array(arrayBuffer));
}

/**
 * Render the first page of a PDF as a small thumbnail. Keeps work light by
 * scaling to a max width of ~220px. Returns an object URL and page count.
 */
export async function generatePdfPreview(file: File): Promise<{
  thumbUrl?: string;
  pageCount?: number;
  label?: string;
}> {
  if (typeof window === 'undefined') {
    return { label: 'PDF' };
  }
  return withTimeout(generatePdfPreviewInner(file), 50_000, 'PDF preview');
}

async function generatePdfPreviewInner(file: File): Promise<{
  thumbUrl?: string;
  pageCount?: number;
  label?: string;
}> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const [pageCount, pdf] = await Promise.all([
    getPdfPageCount(file),
    openPdfBytes(bytes),
  ]);
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 1 });
  const targetWidth = 220;
  const scale = Math.min(1.6, targetWidth / viewport.width);
  const thumbViewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas not supported in this browser.');
  canvas.width = thumbViewport.width;
  canvas.height = thumbViewport.height;
  await page.render({ canvasContext: context, viewport: thumbViewport, canvas }).promise;

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Failed to render preview'))), 'image/jpeg', 0.82);
  });
  const thumbUrl = URL.createObjectURL(blob);
  return {
    thumbUrl,
    pageCount,
    label: 'PDF',
  };
}

export type PdfPageThumb = {
  pageNumber: number;
  thumbUrl: string;
};

/**
 * Renders every page of a PDF to JPEG object URLs for PageGrid. Caller must
 * {@link revokePdfThumbUrls} when discarding results.
 */
export async function renderPdfPageThumbnails(
  file: File,
  options?: {
    maxWidth?: number;
    jpegQuality?: number;
    signal?: AbortSignal;
    /** Called after each page thumbnail is rendered (for progressive UI). */
    onPageDone?: (thumb: PdfPageThumb, done: number, total: number) => void;
  }
): Promise<{ pageCount: number; thumbs: PdfPageThumb[] }> {
  if (typeof window === 'undefined') {
    return { pageCount: 0, thumbs: [] };
  }

  const maxWidth = options?.maxWidth ?? 160;
  const jpegQuality = options?.jpegQuality ?? 0.78;
  const signal = options?.signal;

  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdf = await openPdfBytes(bytes);
  const thumbs: PdfPageThumb[] = [];
  const total = pdf.numPages;

  for (let i = 1; i <= total; i += 1) {
    if (signal?.aborted) {
      revokePdfThumbUrls(thumbs);
      throw new DOMException('Aborted', 'AbortError');
    }
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1 });
    const scale = Math.min(1.4, maxWidth / viewport.width);
    const thumbViewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas not supported in this browser.');
    canvas.width = thumbViewport.width;
    canvas.height = thumbViewport.height;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    await withTimeout(
      page.render({ canvasContext: context, viewport: thumbViewport, canvas }).promise,
      PDF_PAGE_RENDER_TIMEOUT_MS,
      `PDF page ${i} render`
    );

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Failed to render page thumbnail'))),
        'image/jpeg',
        jpegQuality
      );
    });
    const thumb = { pageNumber: i, thumbUrl: URL.createObjectURL(blob) };
    thumbs.push(thumb);
    options?.onPageDone?.(thumb, i, total);
  }

  return { pageCount: total, thumbs };
}

export function revokePdfThumbUrls(thumbs: Pick<PdfPageThumb, 'thumbUrl'>[]) {
  for (const t of thumbs) {
    try {
      URL.revokeObjectURL(t.thumbUrl);
    } catch {
      /* ignore */
    }
  }
}
