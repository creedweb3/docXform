import type { PDFDocumentProxy } from 'pdfjs-dist';

export type ImageFormat = 'png' | 'jpeg';

export async function pdfToImages(
  file: File,
  format: ImageFormat,
  scale: number,
  onProgress?: (percent: number) => void
): Promise<Array<{ name: string; blob: Blob }>> {
  if (typeof window === 'undefined') {
    throw new Error('PDF rendering is only available in the browser.');
  }

  const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
  GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

  const arrayBuffer = await file.arrayBuffer();
  const pdf: PDFDocumentProxy = await getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
  const pages: Array<{ name: string; blob: Blob }> = [];

  for (let i = 1; i <= pdf.numPages; i += 1) {
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
        format === 'jpeg' ? 0.92 : undefined
      );
    });

    pages.push({ name: `${file.name.replace(/\.pdf$/i, '')}-page-${String(i).padStart(3, '0')}.${format}`, blob });
    onProgress?.(Math.round((i / pdf.numPages) * 100));
  }

  return pages;
}
