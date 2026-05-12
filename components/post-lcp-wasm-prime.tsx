'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { getConverterEligibility } from '@/lib/converter-eligibility';
import {
  isCurrentWasmRevisionMarkedCached,
  markCurrentWasmRevisionCached,
  verifyMarkedWasmRevisionStillInHttpCache,
} from '@/lib/wasm-client-cache';
import { buildWasmPrimeAbsoluteUrls } from '@/lib/wasm-prime-urls';

/** Converter routes already warm WASM aggressively; avoid competing fetches. */
const EXCLUDE_CONVERTER_PATH =
  /^\/(?:word-to-pdf|pdf-to-word|doc-to-pdf|docx-to-pdf)(?:\/|$)/i;

/**
 * Enabled in production by default (opt out with NEXT_PUBLIC_WASM_POST_LCP_PRIME=0).
 * In development, set NEXT_PUBLIC_WASM_POST_LCP_PRIME=1 to test.
 */
function isPostLcpPrimeEnabled(): boolean {
  const raw = process.env.NEXT_PUBLIC_WASM_POST_LCP_PRIME?.trim().toLowerCase();
  if (raw === '0' || raw === 'false') return false;
  if (raw === '1' || raw === 'true') return true;
  return process.env.NODE_ENV === 'production';
}

/**
 * After LCP, wait one animation frame + short delay, then optionally GET soffice.wasm / soffice.data
 * with low fetch priority so the HTTP cache is warm before opening a tool page.
 * Skips entirely when this build's WASM revision is marked cached **and** a same-origin
 * `only-if-cached` check confirms both binaries are still in the HTTP cache (see `wasm-client-cache.ts`).

 * Gated by the same eligibility rules as converter auto-preload (save-data / slow link skips).
 */
export function PostLcpWasmPrime() {
  const pathname = usePathname() ?? '';
  const runTokenRef = useRef(0);

  useEffect(() => {
    if (!isPostLcpPrimeEnabled()) return;
    if (typeof window === 'undefined') return;
    if (EXCLUDE_CONVERTER_PATH.test(pathname)) return;

    const token = ++runTokenRef.current;
    const ac = new AbortController();
    let cancelled = false;
    let postLcpTimer: ReturnType<typeof setTimeout> | null = null;
    let lcpFallbackTimer: ReturnType<typeof setTimeout> | null = null;
    let lcpObserver: PerformanceObserver | null = null;
    let lcpSeen = false;

    const runPrime = async () => {
      if (token !== runTokenRef.current) return;
      if (isCurrentWasmRevisionMarkedCached()) return;
      if (ac.signal.aborted) return;

      try {
        const eligibility = await getConverterEligibility();
        if (token !== runTokenRef.current || ac.signal.aborted) return;
        if (!eligibility.autoPreload) return;
        if (isCurrentWasmRevisionMarkedCached()) return;

        const urls = buildWasmPrimeAbsoluteUrls();
        if (!urls) return;

        const sameOrigin = urls.wasm.startsWith(window.location.origin);
        const init = {
          method: 'GET',
          signal: ac.signal,
          cache: 'default' as RequestCache,
          credentials: (sameOrigin ? 'same-origin' : 'omit') as RequestCredentials,
          priority: 'low' as const,
        };

        const resWasm = await fetch(urls.wasm, init as RequestInit);
        if (!resWasm.ok) return;
        const resData = await fetch(urls.data, init as RequestInit);
        if (!resData.ok) return;

        if (token === runTokenRef.current && !ac.signal.aborted) {
          markCurrentWasmRevisionCached();
        }
      } catch {
        /* aborted, offline, or non-OK — ignore */
      }
    };

    const kick = () => {
      if (lcpSeen) return;
      lcpSeen = true;
      if (lcpObserver) {
        try {
          lcpObserver.disconnect();
        } catch {
          /* noop */
        }
        lcpObserver = null;
      }
      if (lcpFallbackTimer !== null) {
        clearTimeout(lcpFallbackTimer);
        lcpFallbackTimer = null;
      }
      const schedule = () => {
        if (token !== runTokenRef.current || ac.signal.aborted) return;
        postLcpTimer = setTimeout(() => {
          postLcpTimer = null;
          void runPrime();
        }, 450);
      };
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(() => requestAnimationFrame(schedule));
      } else {
        schedule();
      }
    };

    const startLcpWatchers = () => {
      if (token !== runTokenRef.current || cancelled || ac.signal.aborted) return;

      if ('PerformanceObserver' in window) {
        try {
          lcpObserver = new PerformanceObserver((list) => {
            if (list.getEntries().length > 0) kick();
          });
          lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true } as PerformanceObserverInit);
        } catch {
          lcpObserver = null;
        }
      }

      if (!lcpObserver) {
        lcpFallbackTimer = setTimeout(kick, 2800);
      } else {
        lcpFallbackTimer = setTimeout(() => {
          if (!lcpSeen) kick();
        }, 9000);
      }
    };

    void (async () => {
      if (isCurrentWasmRevisionMarkedCached()) {
        const urls = buildWasmPrimeAbsoluteUrls();
        if (urls) {
          const inHttpCache = await verifyMarkedWasmRevisionStillInHttpCache(urls);
          if (cancelled || token !== runTokenRef.current || ac.signal.aborted) return;
          if (inHttpCache) return;
        }
      }
      if (cancelled || token !== runTokenRef.current || ac.signal.aborted) return;
      startLcpWatchers();
    })();

    return () => {
      cancelled = true;
      ac.abort();
      if (postLcpTimer !== null) clearTimeout(postLcpTimer);
      if (lcpFallbackTimer !== null) clearTimeout(lcpFallbackTimer);
      if (lcpObserver) {
        try {
          lcpObserver.disconnect();
        } catch {
          /* noop */
        }
      }
    };
  }, [pathname]);

  return null;
}
