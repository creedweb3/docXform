'use client';

import {
  MAX_CONVERSION_BATCH_FILES,
  MAX_CONVERSION_FILE_SIZE_BYTES,
  MAX_CONVERSION_FILE_SIZE_LABEL,
  MAX_CONVERSION_FILE_SIZE_MB,
} from '@/lib/conversion-limits';

export type ConversionMode = 'word-to-pdf' | 'pdf-to-word';

export interface FileValidationResult {
  ok: boolean;
  message?: string;
}

const PDF_SIGNATURE = [0x25, 0x50, 0x44, 0x46, 0x2d];
const ZIP_SIGNATURE = [0x50, 0x4b, 0x03, 0x04];
const DOC_SIGNATURE = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];

function getExtension(filename: string) {
  return filename.split('.').pop()?.toLowerCase() ?? '';
}

async function readBytes(file: File, length: number) {
  return new Uint8Array(await file.slice(0, length).arrayBuffer());
}

function startsWith(bytes: Uint8Array, signature: number[]) {
  return signature.every((value, index) => bytes[index] === value);
}

async function hasDocxStructure(file: File) {
  try {
    const { default: JSZip } = await import('jszip');
    const zip = await JSZip.loadAsync(await file.arrayBuffer(), {
      checkCRC32: false,
    });

    return Boolean(zip.file('[Content_Types].xml') && zip.file('word/document.xml'));
  } catch {
    return false;
  }
}

export function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(1).replace(/\.0$/, '')} MB`;
  }

  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1).replace(/\.0$/, '')} KB`;
  }

  return `${bytes} B`;
}

export function getDynamicBatchLimitBytes(fileCount: number) {
  return fileCount * MAX_CONVERSION_FILE_SIZE_BYTES;
}

export function getDynamicBatchLimitLabel(fileCount: number) {
  return `${fileCount * MAX_CONVERSION_FILE_SIZE_MB} MB`;
}

export async function validateConversionFile(
  file: File,
  mode: ConversionMode
): Promise<FileValidationResult> {
  const extension = getExtension(file.name);

  if (file.size === 0) {
    return {
      ok: false,
      message: `${file.name} is empty. Please choose a file with document content.`,
    };
  }

  if (file.size > MAX_CONVERSION_FILE_SIZE_BYTES) {
    return {
      ok: false,
      message: `${file.name} is larger than ${MAX_CONVERSION_FILE_SIZE_LABEL}.`,
    };
  }

  if (mode === 'pdf-to-word') {
    if (extension !== 'pdf') {
      return {
        ok: false,
        message: `${file.name} is not a PDF file.`,
      };
    }

    const signature = await readBytes(file, PDF_SIGNATURE.length);
    if (!startsWith(signature, PDF_SIGNATURE)) {
      return {
        ok: false,
        message: `${file.name} does not look like a valid PDF file.`,
      };
    }

    return { ok: true };
  }

  if (extension !== 'docx' && extension !== 'doc') {
    return {
      ok: false,
      message: `${file.name} is not a supported Word file. Use DOCX or DOC.`,
    };
  }

  const signature = await readBytes(
    file,
    extension === 'docx' ? ZIP_SIGNATURE.length : DOC_SIGNATURE.length
  );

  if (extension === 'doc') {
    return startsWith(signature, DOC_SIGNATURE)
      ? { ok: true }
      : {
          ok: false,
          message: `${file.name} does not look like a valid legacy DOC file.`,
        };
  }

  if (!startsWith(signature, ZIP_SIGNATURE)) {
    return {
      ok: false,
      message: `${file.name} does not look like a valid DOCX file.`,
    };
  }

  if (!(await hasDocxStructure(file))) {
    return {
      ok: false,
      message: `${file.name} is a ZIP file, but it does not contain a valid DOCX document structure.`,
    };
  }

  return { ok: true };
}

export function validateBatchSize(fileCount: number, totalBytes: number): FileValidationResult {
  if (fileCount > MAX_CONVERSION_BATCH_FILES) {
    return {
      ok: false,
      message: `You can queue up to ${MAX_CONVERSION_BATCH_FILES} files at a time.`,
    };
  }

  const dynamicLimit = getDynamicBatchLimitBytes(fileCount);
  if (totalBytes > dynamicLimit) {
    return {
      ok: false,
      message: `${fileCount} files can use up to ${getDynamicBatchLimitLabel(fileCount)} total.`,
    };
  }

  return { ok: true };
}
