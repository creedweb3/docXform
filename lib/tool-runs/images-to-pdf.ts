import { PDFDocument } from 'pdf-lib';

export type ImageFit = 'fit' | 'contain';

async function decodeToRgba(file: File): Promise<ImageBitmap> {
  const bitmap = await createImageBitmap(file);
  return bitmap;
}

function rgbaToPngBytes(bitmap: ImageBitmap): Promise<Uint8Array> {
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported in this browser.');
  ctx.drawImage(bitmap, 0, 0);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Failed to encode PNG'));
      blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)));
    }, 'image/png');
  });
}

function rgbaToJpegBytes(bitmap: ImageBitmap): Promise<Uint8Array> {
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported in this browser.');
  ctx.drawImage(bitmap, 0, 0);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Failed to encode JPEG'));
        blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)));
      },
      'image/jpeg',
      0.92
    );
  });
}

export async function imagesToPdf(
  files: File[],
  fit: ImageFit,
  onProgress?: (percent: number) => void
): Promise<Blob> {
  if (typeof window === 'undefined') {
    throw new Error('Images to PDF runs only in the browser.');
  }

  const pdf = await PDFDocument.create();

  for (let idx = 0; idx < files.length; idx += 1) {
    const file = files[idx];
    const lower = file.name.toLowerCase();
    const isPng = lower.endsWith('.png');
    const isJpg = lower.endsWith('.jpg') || lower.endsWith('.jpeg');
    const isWebp = lower.endsWith('.webp');

    let bytes: Uint8Array;
    if (isWebp) {
      // Decode WebP via ImageBitmap then re-encode to JPEG for pdf-lib
      const bitmap = await decodeToRgba(file);
      bytes = await rgbaToJpegBytes(bitmap);
    } else if (isPng) {
      bytes = new Uint8Array(await file.arrayBuffer());
    } else if (isJpg) {
      bytes = new Uint8Array(await file.arrayBuffer());
    } else {
      // Fallback: attempt decode and re-encode to PNG
      const bitmap = await decodeToRgba(file);
      bytes = await rgbaToPngBytes(bitmap);
    }

    const img = isPng ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
    const { width, height } = img.size();

    const page = pdf.addPage();
    const pageWidth = page.getWidth();
    const pageHeight = page.getHeight();
    let drawWidth = width;
    let drawHeight = height;

    if (fit === 'fit' || width > pageWidth || height > pageHeight) {
      const scale = Math.min(pageWidth / width, pageHeight / height);
      drawWidth = width * scale;
      drawHeight = height * scale;
    }

    page.drawImage(img, {
      x: (pageWidth - drawWidth) / 2,
      y: (pageHeight - drawHeight) / 2,
      width: drawWidth,
      height: drawHeight,
    });

    onProgress?.(Math.round(((idx + 1) / files.length) * 100));
  }

  const out = await pdf.save();
  return new Blob([new Uint8Array(out)], { type: 'application/pdf' });
}
