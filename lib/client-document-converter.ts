'use client';

import type {
  ConversionResult,
  InputFormat,
  OutputFormat,
  WasmLoadProgress,
  WorkerBrowserConverter,
} from '@matbee/libreoffice-converter/browser';
import { getBrowserWorkerJsUrl, getWasmAssetBaseForCreatePaths } from '@/lib/wasm-asset-base';

export interface ClientConversionProgress {
  percent: number;
  message: string;
}

export interface ConvertedDocument {
  name: string;
  blob: Blob;
  originalName: string;
}

type ProgressHandler = (progress: ClientConversionProgress) => void;

let converterPromise: Promise<WorkerBrowserConverter> | null = null;
let converterInstance: WorkerBrowserConverter | null = null;
let activeProgressHandler: ProgressHandler | null = null;
let conversionQueue: Promise<void> = Promise.resolve();

const INITIALIZE_TIMEOUT_MS = 90_000;
const CONVERSION_TIMEOUT_MS = 240_000;

const MIME_TYPES: Record<OutputFormat, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  doc: 'application/msword',
  odt: 'application/vnd.oasis.opendocument.text',
  rtf: 'application/rtf',
  txt: 'text/plain',
  html: 'text/html',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xls: 'application/vnd.ms-excel',
  ods: 'application/vnd.oasis.opendocument.spreadsheet',
  csv: 'text/csv',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ppt: 'application/vnd.ms-powerpoint',
  odp: 'application/vnd.oasis.opendocument.presentation',
  png: 'image/png',
  jpg: 'image/jpeg',
  svg: 'image/svg+xml',
};

function emitProgress(progress: WasmLoadProgress | ClientConversionProgress) {
  activeProgressHandler?.({
    percent: Math.max(0, Math.min(100, progress.percent)),
    message: progress.message,
  });
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out. Please try again with a smaller or simpler file.`));
    }, timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

async function resetConverter() {
  converterPromise = null;

  if (!converterInstance) {
    return;
  }

  const instance = converterInstance;
  converterInstance = null;

  try {
    await instance.destroy();
  } catch {
    // Ignore cleanup failures and allow a fresh instance on next run.
  }
}

async function getConverter(onProgress?: ProgressHandler) {
  activeProgressHandler = onProgress ?? null;

  if (!converterPromise) {
    converterPromise = (async () => {
      const { WorkerBrowserConverter, createWasmPaths } = await import(
        '@matbee/libreoffice-converter/browser'
      );

      const converter = new WorkerBrowserConverter({
        ...createWasmPaths(getWasmAssetBaseForCreatePaths()),
        browserWorkerJs: getBrowserWorkerJsUrl(),
        onProgress: emitProgress,
      });

      await withTimeout(converter.initialize(), INITIALIZE_TIMEOUT_MS, 'Converter initialization');
      converterInstance = converter;
      return converter;
    })().catch((error) => {
      void resetConverter();
      throw error;
    });
  }

  return converterPromise;
}

export async function warmConverter(onProgress?: ProgressHandler) {
  await getConverter(onProgress);
}

function mapProgress(onProgress: ProgressHandler | undefined, start: number, end: number) {
  activeProgressHandler = ({ percent, message }) => {
    onProgress?.({
      percent: start + (Math.max(0, Math.min(100, percent)) / 100) * (end - start),
      message,
    });
  };
}

function getInputFormat(filename: string): InputFormat {
  const ext = filename.split('.').pop()?.toLowerCase();

  if (
    ext === 'doc' ||
    ext === 'docx' ||
    ext === 'pdf' ||
    ext === 'rtf' ||
    ext === 'txt' ||
    ext === 'html' ||
    ext === 'htm'
  ) {
    return ext === 'htm' ? 'html' : ext;
  }

  return 'docx';
}

function replaceExtension(filename: string, outputFormat: OutputFormat) {
  const base = filename.includes('.')
    ? filename.slice(0, filename.lastIndexOf('.'))
    : filename;

  return `${base}.${outputFormat}`;
}

function bytesToBlob(bytes: Uint8Array, mimeType: string) {
  const copy = new Uint8Array(bytes.length);
  copy.set(bytes);
  return new Blob([copy.buffer], { type: mimeType });
}

function assertValidOutput(result: ConversionResult, outputFormat: OutputFormat) {
  const bytes = result.data;

  if (outputFormat === 'pdf') {
    const startsWithPdf =
      bytes.length >= 5 &&
      bytes[0] === 0x25 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x44 &&
      bytes[3] === 0x46 &&
      bytes[4] === 0x2d;

    if (!startsWithPdf) {
      throw new Error('Conversion did not produce a valid PDF file.');
    }
  }

  if (outputFormat === 'docx') {
    const startsWithZip =
      bytes.length >= 4 &&
      bytes[0] === 0x50 &&
      bytes[1] === 0x4b &&
      bytes[2] === 0x03 &&
      bytes[3] === 0x04;

    if (!startsWithZip) {
      throw new Error('Conversion did not produce a valid DOCX file.');
    }
  }
}

export async function convertDocumentFile(
  file: File,
  outputFormat: OutputFormat,
  onProgress?: ProgressHandler
): Promise<ConvertedDocument> {
  const runConversion = async (): Promise<ConvertedDocument> => {
    activeProgressHandler = onProgress ?? null;
    emitProgress({ percent: 1, message: 'Preparing document...' });

    const converter = await getConverter(onProgress);
    const inputFormat = getInputFormat(file.name);
    const inputBytes = new Uint8Array(await file.arrayBuffer());

    emitProgress({ percent: 85, message: `Converting ${file.name}...` });

    let result: ConversionResult;

    if (inputFormat === 'pdf' && outputFormat === 'docx') {
      mapProgress(onProgress, 5, 45);
      const htmlResult = await withTimeout(
        converter.convert(
          inputBytes,
          { inputFormat: 'pdf', outputFormat: 'html' },
          file.name
        ),
        CONVERSION_TIMEOUT_MS,
        'PDF to HTML conversion'
      );

      mapProgress(onProgress, 45, 99);
      result = await withTimeout(
        converter.convert(
          htmlResult.data,
          { inputFormat: 'html', outputFormat: 'docx' },
          replaceExtension(file.name, 'html')
        ),
        CONVERSION_TIMEOUT_MS,
        'HTML to DOCX conversion'
      );
    } else {
      activeProgressHandler = onProgress ?? null;
      result = await withTimeout(
        converter.convert(
          inputBytes,
          {
            inputFormat,
            outputFormat,
            pdf: outputFormat === 'pdf' ? { quality: 95 } : undefined,
          },
          file.name
        ),
        CONVERSION_TIMEOUT_MS,
        'Document conversion'
      );
    }

    assertValidOutput(result, outputFormat);
    emitProgress({ percent: 100, message: 'Conversion complete' });

    return {
      name: replaceExtension(file.name, outputFormat),
      blob: bytesToBlob(result.data, result.mimeType || MIME_TYPES[outputFormat]),
      originalName: file.name,
    };
  };

  const queued = conversionQueue.then(runConversion, runConversion);
  conversionQueue = queued.then(() => undefined, () => undefined);

  try {
    return await queued;
  } catch (error) {
    await resetConverter();
    throw error;
  }
}

export function conversionErrorMessage(error: unknown) {
  const rawMessage =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : '';

  const message = rawMessage.replace(/\s+/g, ' ').trim();
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes('timed out') ||
    lowerMessage.includes('timeout') ||
    lowerMessage.includes('timeoput') ||
    lowerMessage.includes('worker')
  ) {
    return 'Conversion timed out in your browser. Please retry with a smaller or simpler file.';
  }

  if (lowerMessage.includes('password') || lowerMessage.includes('encrypted')) {
    return 'This file appears to be password-protected or encrypted. Please unlock it and try again.';
  }

  if (
    lowerMessage.includes('corrupt') ||
    lowerMessage.includes('damaged') ||
    lowerMessage.includes('malformed')
  ) {
    return 'This file appears to be damaged or malformed. Please try a clean copy of the document.';
  }

  if (lowerMessage.includes('unsupported') || lowerMessage.includes('unknown format')) {
    return 'This file format is not supported by the browser converter.';
  }

  if (lowerMessage.includes('valid pdf')) {
    return 'Conversion did not produce a valid PDF. Please try a different source file.';
  }

  if (lowerMessage.includes('valid docx')) {
    return 'Conversion did not produce a valid DOCX. Please try a different source file.';
  }

  if (
    lowerMessage.includes('failed to fetch') ||
    lowerMessage.includes('networkerror') ||
    lowerMessage.includes('load')
  ) {
    return 'The converter engine could not load. Refresh the page and try again.';
  }

  if (!message || message.length > 180) {
    return 'The document could not be converted. Please try a smaller or simpler file.';
  }

  return message;
}
