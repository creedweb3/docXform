/**
 * Ambient typings for pdfjs-dist legacy bundle (runtime path has no .d.ts in package).
 * Keep surface minimal to what DocXform imports.
 */
declare module 'pdfjs-dist/legacy/build/pdf' {
  export type RenderTask = { promise: Promise<void> };

  export interface PDFPageProxy {
    getViewport(params: { scale: number }): { width: number; height: number };
    render(params: {
      canvasContext: CanvasRenderingContext2D;
      viewport: { width: number; height: number };
      canvas?: HTMLCanvasElement;
    }): RenderTask;
    getTextContent(): Promise<{ items: unknown[] }>;
  }

  export interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
  }

  export interface PDFDocumentLoadingTask {
    promise: Promise<PDFDocumentProxy>;
  }

  export function getDocument(src: { data: Uint8Array | ArrayBuffer }): PDFDocumentLoadingTask;

  export const GlobalWorkerOptions: {
    workerSrc: string;
  };
}
