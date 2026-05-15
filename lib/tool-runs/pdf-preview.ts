import type { PDFDocumentProxy } from 'pdfjs-dist/legacy/build/pdf';

import { loadPdfJs } from '@/lib/pdfjs-load';

export async function getPdfMeta(file: File): Promise<{ pageCount: number }> {
  if (typeof window === 'undefined') return { pageCount: 0 };
  const { getDocument } = await loadPdfJs();
  const pdf: PDFDocumentProxy = await getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  return { pageCount: pdf.numPages };
}
