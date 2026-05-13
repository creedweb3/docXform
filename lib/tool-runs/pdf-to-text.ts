/**
 * Extract text content from each page of a PDF using pdfjs-dist. Falls back to
 * an empty string per page if the PDF is image-only (we don't OCR on-device).
 */
export type PdfTextResult = {
  pages: Array<{ pageNumber: number; text: string }>;
  combined: string;
};

export async function pdfToText(
  file: File,
  onProgress?: (percent: number) => void
): Promise<PdfTextResult> {
  if (typeof window === 'undefined') {
    throw new Error('PDF text extraction runs only in the browser.');
  }

  const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
  if (!GlobalWorkerOptions.workerSrc) {
    GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
  }

  const pdf = await getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const total = pdf.numPages;
  const pages: Array<{ pageNumber: number; text: string }> = [];

  for (let i = 1; i <= total; i += 1) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const items = content.items as Array<{ str?: string; hasEOL?: boolean }>;
    const text = items
      .map((item) => (item.hasEOL ? `${item.str ?? ''}\n` : `${item.str ?? ''} `))
      .join('')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    pages.push({ pageNumber: i, text });
    onProgress?.(Math.round((i / total) * 100));
  }

  const combined = pages
    .map((page) => (page.text ? `--- Page ${page.pageNumber} ---\n${page.text}` : `--- Page ${page.pageNumber} ---\n(no text on this page)`))
    .join('\n\n');

  return { pages, combined };
}
