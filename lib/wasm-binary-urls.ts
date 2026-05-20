import { getWasmAssetRevision } from '@/lib/wasm-revision';

const WX_QUERY_KEY = '_wx';

/**
 * Cache-bust query for HTTPS WASM bases when paths are not fully versioned on CDN.
 */
function appendWasmRevisionQuery(url: string): string {
  const v = encodeURIComponent(getWasmAssetRevision());
  return `${url}${url.includes('?') ? '&' : '?'}${WX_QUERY_KEY}=${v}`;
}

function resolveWasmUrl(base: string, name: string): string {
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  if (/^https?:\/\//i.test(normalizedBase)) {
    return new URL(name, normalizedBase).href;
  }
  if (typeof window !== 'undefined') {
    return new URL(name, `${window.location.origin}${normalizedBase}`).href;
  }
  return `${normalizedBase}${name}`;
}

/** Absolute fetch URL for heavy binaries; HTTPS bases get `_wx` revision query (same-origin uses versioned path). */
export function wasmBinaryFetchUrl(base: string, name: 'soffice.wasm' | 'soffice.data'): string {
  const resolved = resolveWasmUrl(base, name);
  if (/^https?:\/\//i.test(base)) {
    return appendWasmRevisionQuery(resolved);
  }
  return resolved;
}
