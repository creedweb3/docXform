import { getWasmAssetRevision } from '@/lib/wasm-revision';

/**
 * After a full successful WASM load (prime or converter init), we persist the
 * asset revision so revisits can skip optional warming and use HTTP-cache-friendly probes.
 * Bump `NEXT_PUBLIC_WASM_ASSET_REVISION` when R2 binaries change — then this no longer matches
 * and the client will download again under the new versioned URLs.
 */
const STORAGE_KEY = 'docxform_wasm_cached_asset_revision';

export function getClientStoredWasmRevision(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    const t = v?.trim();
    return t ? t : null;
  } catch {
    return null;
  }
}

/** True when the last successful install in this profile matches the revision baked into this build. */
export function isCurrentWasmRevisionMarkedCached(): boolean {
  return getClientStoredWasmRevision() === getWasmAssetRevision();
}

/** Drop the client hint (e.g. after detecting HTTP cache no longer holds the WASM pair). */
export function clearWasmRevisionCacheMark(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}

export function markCurrentWasmRevisionCached(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, getWasmAssetRevision());
  } catch {
    /* quota / private mode */
  }
}

function isAbsoluteUrlSameOrigin(absoluteUrl: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return new URL(absoluteUrl).origin === window.location.origin;
  } catch {
    return false;
  }
}

/**
 * True only if a response is served from the HTTP cache (no network).
 * Requires `mode: 'same-origin'` per fetch spec for `only-if-cached`.
 *
 * We avoid `Range` here: Emscripten caches full 200 responses; a ranged
 * `only-if-cached` request often misses that entry and surfaces as `ERR_CACHE_MISS`,
 * which looked like a broken load and cleared the revision mark incorrectly.
 */
async function resourceInHttpCacheOnlyIfCached(absoluteUrl: string): Promise<boolean> {
  try {
    const headRes = await fetch(absoluteUrl, {
      method: 'HEAD',
      cache: 'only-if-cached',
      mode: 'same-origin',
    });
    if (headRes.ok) return true;
  } catch {
    /* try GET below */
  }
  try {
    const res = await fetch(absoluteUrl, {
      method: 'GET',
      cache: 'only-if-cached',
      mode: 'same-origin',
    });
    if (!res.ok) return false;
    if (res.body) {
      await res.body.cancel();
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * When the profile marks this revision as installed, confirm the browser HTTP cache still has
 * both binaries. If the user cleared cached files but kept site data, this fails, we clear the
 * mark, and the app will download again.
 *
 * For cross-origin WASM URLs (dev with `NEXT_PUBLIC_WASM_ASSET_BASE` HTTPS), `only-if-cached` is
 * not usable; we return true and keep trusting the mark — rare in production (same-origin `/wasm/`).
 */
export async function verifyMarkedWasmRevisionStillInHttpCache(urls: {
  wasm: string;
  data: string;
}): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!isCurrentWasmRevisionMarkedCached()) return false;

  if (!isAbsoluteUrlSameOrigin(urls.wasm) || !isAbsoluteUrlSameOrigin(urls.data)) {
    return true;
  }

  const [wasmOk, dataOk] = await Promise.all([
    resourceInHttpCacheOnlyIfCached(urls.wasm),
    resourceInHttpCacheOnlyIfCached(urls.data),
  ]);

  if (wasmOk && dataOk) {
    return true;
  }

  clearWasmRevisionCacheMark();
  return false;
}
