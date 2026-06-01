'use client';

import { PDFDocument } from 'pdf-lib';

/**
 * Page count via pdf-lib — no pdf.js worker required (fast, reliable for studio gating).
 */
export async function getPdfPageCount(file: File): Promise<number> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  return doc.getPageCount();
}
