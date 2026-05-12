'use client';

import { useEffect } from 'react';

const SW_PATH = '/wasm-cache-sw.js';

function isWasmCacheSwEnabled(): boolean {
  const raw = process.env.NEXT_PUBLIC_WASM_CACHE_SW?.trim().toLowerCase();
  if (raw === '0' || raw === 'false') return false;
  if (raw === '1' || raw === 'true') return true;
  return process.env.NODE_ENV === 'production';
}

/**
 * Registers a minimal service worker that cache-firsts versioned WASM/data URLs
 * via the Cache API (separate from HTTP disk cache) for faster repeat loads.
 */
export function WasmCacheServiceWorker() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isWasmCacheSwEnabled()) return;
    if (!('serviceWorker' in navigator)) return;

    const { protocol, hostname } = window.location;
    const secure =
      protocol === 'https:' || hostname === 'localhost' || hostname === '127.0.0.1';
    if (!secure) return;

    let cancelled = false;
    const register = () => {
      if (cancelled) return;
      void navigator.serviceWorker
        .register(SW_PATH, { scope: '/', updateViaCache: 'none' })
        .then((reg) => {
          if (cancelled) return;
          void reg.update().catch(() => {});
        })
        .catch(() => {});
    };

    const t = window.setTimeout(register, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, []);

  return null;
}
