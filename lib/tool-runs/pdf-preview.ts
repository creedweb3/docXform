import type { PDFDocumentProxy } from 'pdfjs-dist/legacy/build/pdf';

export async function getPdfMeta(file: File): Promise<{ pageCount: number }> {
  if (typeof window === 'undefined') return { pageCount: 0 };
  const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist/legacy/build/pdf');
  if (!GlobalWorkerOptions.workerSrc) {
    GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
  }
  const pdf: PDFDocumentProxy = await getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  return { pageCount: pdf.numPages };
}
