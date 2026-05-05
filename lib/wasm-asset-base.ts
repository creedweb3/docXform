/**
 * LibreOffice WASM assets are served from `/public/wasm/` at the URL prefix `/wasm/`.
 *
 * Large binaries (`soffice.wasm`, `soffice.data`) are gitignored; copy them into `public/wasm/`
 * alongside the small scripts from `@matbee/libreoffice-converter` so the browser converter can start.
 */
export function getWasmAssetBaseForCreatePaths(): string {
  return '/wasm/';
}

export function getBrowserWorkerJsUrl(): string {
  return '/wasm/browser.worker.global.js';
}

/** Resolve an asset under the wasm folder to an absolute URL (client: uses `window.location` origin). */
export function getWasmAssetFileUrl(fileName: string): string {
  const base = getWasmAssetBaseForCreatePaths();
  const name = fileName.replace(/^\//, '');
  if (typeof window !== 'undefined') {
    return new URL(name, `${window.location.origin}${base}`).href;
  }
  return `${base}${name}`;
}
