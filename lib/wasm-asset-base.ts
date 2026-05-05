/**
 * LibreOffice WASM is served from `/public/wasm/` at `/wasm/` by default.
 *
 * **Production (GitHub / Netlify):** `soffice.wasm` is often ~140MB (over GitHub’s 100MB file cap).
 * Either use **Git LFS** for `public/wasm/soffice.{wasm,data}` (see `.gitattributes`) or set
 * `NEXT_PUBLIC_WASM_ASSET_BASE` to an HTTPS URL of a folder that mirrors `/wasm/` (same filenames).
 *
 * **CORS:** if you use a separate origin for WASM, allow your site origin on that host (GET, HEAD).
 */
export function getWasmAssetBaseForCreatePaths(): string {
  /**
   * Production hardening: prefer same-origin `/wasm/` to avoid cross-origin worker edge cases.
   * You can opt out by setting NEXT_PUBLIC_WASM_FORCE_SAME_ORIGIN=0.
   */
  const forceSameOrigin = process.env.NEXT_PUBLIC_WASM_FORCE_SAME_ORIGIN !== '0';
  if (process.env.NODE_ENV === 'production' && forceSameOrigin) {
    return '/wasm/';
  }

  const raw = process.env.NEXT_PUBLIC_WASM_ASSET_BASE?.trim();
  if (raw && /^https?:\/\//i.test(raw)) {
    return raw.endsWith('/') ? raw : `${raw}/`;
  }
  return '/wasm/';
}

export function getBrowserWorkerJsUrl(): string {
  /**
   * Worker entry script must stay same-origin for broad browser compatibility.
   * Keep this tiny loader in `public/wasm/`, while heavy `.wasm`/`.data` can live on CDN.
   */
  return '/wasm/browser.worker.global.js?v=2';
}

/** Resolve an asset under the wasm folder to an absolute URL (client: uses `window.location` for same-origin `/wasm/`). */
export function getWasmAssetFileUrl(fileName: string): string {
  const base = getWasmAssetBaseForCreatePaths();
  const name = fileName.replace(/^\//, '');
  if (base.startsWith('http')) {
    return new URL(name, base).href;
  }
  if (typeof window !== 'undefined') {
    return new URL(name, `${window.location.origin}${base}`).href;
  }
  return `${base}${name}`;
}
