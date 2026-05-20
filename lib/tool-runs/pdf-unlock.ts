import { PDFDocument } from 'pdf-lib';

/**
 * Re-saves a PDF without the owner password / restrictive permissions.
 * This works for the common case where the file is not user-password protected
 * (i.e., it opens but blocks print/copy/edit). For files that require a password
 * to open, the user must provide it; we cannot brute force in the browser.
 */
export async function unlockPdf(
  file: File,
  onProgress?: (percent: number) => void
): Promise<Blob> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  onProgress?.(20);
  const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
  onProgress?.(60);
  const out = await PDFDocument.create();
  const pages = await out.copyPages(pdf, pdf.getPageIndices());
  pages.forEach((page) => out.addPage(page));
  onProgress?.(85);
  const saved = await out.save({ useObjectStreams: true });
  onProgress?.(100);
  return new Blob([new Uint8Array(saved)], { type: 'application/pdf' });
}
