'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { getConverterEligibility } from '@/lib/converter-eligibility';
import { buildWasmPrimeAbsoluteUrls } from '@/lib/wasm-prime-urls';

const SESSION_KEY = 'docxform_wasm_http_prime_v1';

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
 * Gated by the same eligibility rules as converter auto-preload (save-data / slow link skips).
 */
export function PostLcpWasmPrime() {
  const pathname = usePathname() ?? '';
  const runTokenRef = useRef(0);

  useEffect(() => {
    if (!isPostLcpPrimeEnabled()) return;
    if (typeof window === 'undefined') return;
    if (EXCLUDE_CONVERTER_PATH.test(pathname)) return;
    if (sessionStorage.getItem(SESSION_KEY) === '1') return;

    const token = ++runTokenRef.current;
    const ac = new AbortController();
    let postLcpTimer: ReturnType<typeof setTimeout> | null = null;
    let lcpFallbackTimer: ReturnType<typeof setTimeout> | null = null;
    let lcpObserver: PerformanceObserver | null = null;
    let lcpSeen = false;

    const runPrime = async () => {
      if (token !== runTokenRef.current) return;
      if (sessionStorage.getItem(SESSION_KEY) === '1') return;
      if (ac.signal.aborted) return;

      try {
        const eligibility = await getConverterEligibility();
        if (token !== runTokenRef.current || ac.signal.aborted) return;
        if (!eligibility.autoPreload) return;

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
          sessionStorage.setItem(SESSION_KEY, '1');
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

    return () => {
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
