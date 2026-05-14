import { PDFDocument } from 'pdf-lib';

export type Preset = 'light' | 'balanced' | 'max';

async function renderPageToBlob(page: any, scale: number, quality: number): Promise<Blob> {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas not supported in this browser.');

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({ canvasContext: context, viewport }).promise;

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error('Failed to render page'));
        else resolve(blob);
      },
      'image/jpeg',
      quality
    );
  });
}

export async function compressPdf(file: File, preset: Preset, onProgress?: (percent: number) => void): Promise<Blob> {
  if (typeof window === 'undefined') {
    throw new Error('PDF compression runs only in the browser.');
  }

  const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist/legacy/build/pdf');
  if (!GlobalWorkerOptions.workerSrc) {
    GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
  }

  const mimeQuality = preset === 'light' ? 0.55 : preset === 'balanced' ? 0.7 : 0.82;
  const renderScale = preset === 'light' ? 1 : preset === 'balanced' ? 1.2 : 1.4;

  const pdf = await getDocument({ data: await file.arrayBuffer() }).promise;
  const out = await PDFDocument.create();
  const totalPages = pdf.numPages;

  for (let i = 1; i <= totalPages; i += 1) {
    const page = await pdf.getPage(i);
    const blob = await renderPageToBlob(page, renderScale, mimeQuality);
    const arrayBuffer = await blob.arrayBuffer();
    const embedded = await out.embedJpg(arrayBuffer);
    const { width, height } = embedded.scale(1);
    const newPage = out.addPage([width, height]);
    newPage.drawImage(embedded, { x: 0, y: 0, width, height });
    onProgress?.(Math.round((i / totalPages) * 100));
  }

  const bytes = await out.save({ useObjectStreams: true });
  return new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
}
