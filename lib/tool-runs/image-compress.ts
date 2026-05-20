export type CompressPreset = 'web' | 'balanced' | 'archive';

export type ImageCompressResult = {
  name: string;
  blob: Blob;
  originalSize: number;
  compressedSize: number;
};

const PRESETS: Record<CompressPreset, { maxDimension: number; quality: number }> = {
  web: { maxDimension: 1600, quality: 0.7 },
  balanced: { maxDimension: 2200, quality: 0.78 },
  archive: { maxDimension: 4000, quality: 0.85 },
};

async function decodeToBitmap(file: File): Promise<ImageBitmap> {
  if (typeof createImageBitmap === 'function') {
    return createImageBitmap(file);
  }
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = url;
    await image.decode();
    return await createImageBitmap(image);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function compressImage(
  file: File,
  preset: CompressPreset,
  onProgress?: (percent: number) => void
): Promise<ImageCompressResult> {
  if (typeof window === 'undefined') {
    throw new Error('Image compression runs only in the browser.');
  }

  const settings = PRESETS[preset];
  onProgress?.(10);
  const bitmap = await decodeToBitmap(file);

  const scale = Math.min(1, settings.maxDimension / Math.max(bitmap.width, bitmap.height));
  const targetWidth = Math.max(1, Math.round(bitmap.width * scale));
  const targetHeight = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D not supported in this browser.');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, targetWidth, targetHeight);
  ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
  onProgress?.(70);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (out) => {
        if (!out) reject(new Error('Failed to encode compressed image.'));
        else resolve(out);
      },
      'image/jpeg',
      settings.quality
    );
  });
  onProgress?.(100);

  return {
    name: file.name.replace(/\.[^.]+$/, '') + '-compressed.jpg',
    blob,
    originalSize: file.size,
    compressedSize: blob.size,
  };
}
