import { getWasmAssetBaseForCreatePaths } from '@/lib/wasm-asset-base';
import { getWasmAssetRevision, getVersionedWasmBinPathPrefix } from '@/lib/wasm-revision';

/** Match converter CDN query for revisioned fetches (see `lib/client-document-converter.ts`). */
function withRevisionQuery(url: string): string {
  const key = '_wx';
  const v = encodeURIComponent(getWasmAssetRevision());
  return `${url}${url.includes('?') ? '&' : '?'}${key}=${v}`;
}

/**
 * Absolute URLs used only for optional HTTP cache priming after LCP.
 * Same-origin production uses `/wasm/bin/<rev>/soffice.{wasm,data}`; HTTPS bases get `_wx` like the converter.
 */
export function buildWasmPrimeAbsoluteUrls(): { wasm: string; data: string } | null {
  if (typeof window === 'undefined') return null;

  const base = getWasmAssetBaseForCreatePaths();

  if (/^https?:\/\//i.test(base)) {
    const normalized = base.endsWith('/') ? base : `${base}/`;
    const wasm = withRevisionQuery(new URL('soffice.wasm', normalized).href);
    const data = withRevisionQuery(new URL('soffice.data', normalized).href);
    return { wasm, data };
  }

  const prefix = getVersionedWasmBinPathPrefix();
  const origin = window.location.origin;
  const dir = `${origin}${prefix}`;
  return {
    wasm: new URL('soffice.wasm', dir).href,
    data: new URL('soffice.data', dir).href,
  };
}
