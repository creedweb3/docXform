import type { PDFDocumentProxy } from 'pdfjs-dist/legacy/build/pdf';

import { PDFJS_WORKER_PUBLIC_PATH } from '@/lib/pdfjs-load';

export type ImageFormat = 'png' | 'jpeg';

export async function pdfToImages(
  file: File,
  format: ImageFormat,
  scale: number,
  onProgress?: (percent: number) => void,
  /** 1-based page numbers to render, in order. Omit to render all pages. */
  pages?: number[],
  /** Used when format is JPEG (passed to canvas.toBlob). Defaults to 0.92. */
  jpegQuality?: number
): Promise<Array<{ name: string; blob: Blob }>> {
  if (typeof window === 'undefined') {
    throw new Error('PDF rendering is only available in the browser.');
  }

  const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist/legacy/build/pdf');
  GlobalWorkerOptions.workerSrc = PDFJS_WORKER_PUBLIC_PATH;

  const arrayBuffer = await file.arrayBuffer();
  const pdf: PDFDocumentProxy = await getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
  const pageList =
    pages && pages.length > 0
      ? pages.filter((p) => Number.isInteger(p) && p >= 1 && p <= pdf.numPages)
      : Array.from({ length: pdf.numPages }, (_, j) => j + 1);
  const outPages: Array<{ name: string; blob: Blob }> = [];

  let done = 0;
  const total = pageList.length;
  for (const i of pageList) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas not supported in this browser.');

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport, canvas }).promise;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (!b) reject(new Error('Failed to render image'));
          else resolve(b);
        },
        format === 'png' ? 'image/png' : 'image/jpeg',
        format === 'jpeg' ? (jpegQuality ?? 0.92) : undefined
      );
    });

    outPages.push({ name: `${file.name.replace(/\.pdf$/i, '')}-page-${String(i).padStart(3, '0')}.${format}`, blob });
    done += 1;
    onProgress?.(Math.round((done / total) * 100));
  }

  return outPages;
}
