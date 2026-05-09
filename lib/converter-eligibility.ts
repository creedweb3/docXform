/**
 * Decides whether to auto-preload the LibreOffice WASM stack after page load.
 * Combines Network Information API, a small throughput probe, device signals,
 * and an 8s "ready" budget (download + rough init).
 */
import {
  computePerfProfile,
  getCachedPerfProfile,
  invalidatePerfProfileCache,
  type PerfProfile,
} from '@/lib/perf-profile';
import { getWasmAssetRevision } from '@/lib/wasm-revision';

export const CONVERTER_READINESS_BUDGET_SEC = 8;

/** Combined soffice.wasm + soffice.data (override via env for accurate ETA). */
export function getCombinedWasmBytes(): number {
  const raw = process.env.NEXT_PUBLIC_WASM_BUNDLE_BYTES;
  if (typeof raw === 'string' && /^\d+$/.test(raw.trim())) {
    return Math.max(1, parseInt(raw.trim(), 10));
  }
  return 170 * 1024 * 1024;
}

function connectionDownlinkMbps(): number | null {
  if (typeof navigator === 'undefined') return null;
  const c = (navigator as Navigator & { connection?: { downlink?: number } }).connection;
  if (c && typeof c.downlink === 'number' && c.downlink > 0 && Number.isFinite(c.downlink)) {
    return c.downlink;
  }
  return null;
}

function effectiveTypeFallbackMbps(effectiveType: string): number {
  switch (effectiveType) {
    case 'slow-2g':
      return 0.05;
    case '2g':
      return 0.15;
    case '3g':
      return 0.4;
    case '4g':
      return 4;
    default:
      return 1.2;
  }
}

function theoreticalMbpsFromSignals(): number {
  if (typeof navigator === 'undefined') return 1.2;
  const dl = connectionDownlinkMbps();
  if (dl !== null) return dl;
  const et =
    (navigator as Navigator & { connection?: { effectiveType?: string } }).connection
      ?.effectiveType ?? '';
  return effectiveTypeFallbackMbps(et);
}

function initOverheadSec(profile: PerfProfile): number {
  switch (profile) {
    case 'low':
      return 9;
    case 'high':
      return 4;
    default:
      return 6;
  }
}

async function measureProbeMbps(signal: AbortSignal): Promise<number | null> {
  if (typeof window === 'undefined') return null;
  const url = `/favicon.ico?docxform_probe=${encodeURIComponent(getWasmAssetRevision())}`;
  const t0 = performance.now();
  try {
    const res = await fetch(url, { cache: 'no-store', signal });
    const buf = await res.arrayBuffer();
    const ms = performance.now() - t0;
    if (ms < 5 || buf.byteLength < 8) return null;
    const bits = buf.byteLength * 8;
    return bits / ms / 1000;
  } catch {
    return null;
  }
}

export interface ConverterEligibility {
  autoPreload: boolean;
  estimatedDownloadSec: number;
  estimatedInitSec: number;
  estimatedReadySec: number;
  measuredMbps: number | null;
  theoreticalMbps: number | null;
  effectiveMbps: number;
  reason: string;
  perfProfile: PerfProfile;
}

let eligibilityPromise: Promise<ConverterEligibility> | null = null;
let connectionListenerAttached = false;

function invalidateEligibility(): void {
  eligibilityPromise = null;
}

/**
 * Recompute perf tier when `connection` changes (e.g. Wi‑Fi → cellular).
 */
export function subscribeConnectionEligibilityInvalidation(): void {
  if (typeof window === 'undefined' || connectionListenerAttached) return;
  const nav = navigator as Navigator & {
    connection?: EventTarget & { addEventListener?: (t: string, fn: () => void) => void };
  };
  const conn = nav.connection as
    | (EventTarget & { addEventListener?: (t: string, fn: () => void) => void })
    | undefined;
  if (!conn?.addEventListener) return;
  connectionListenerAttached = true;
  const onChange = () => {
    invalidateEligibility();
    invalidatePerfProfileCache();
  };
  conn.addEventListener('change', onChange);
}

function isSaveData(): boolean {
  if (typeof navigator === 'undefined') return false;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return Boolean(conn?.saveData);
}

async function computeEligibility(signal: AbortSignal): Promise<ConverterEligibility> {
  if (typeof window === 'undefined') {
    return {
      autoPreload: true,
      estimatedDownloadSec: 0,
      estimatedInitSec: 0,
      estimatedReadySec: 0,
      measuredMbps: null,
      theoreticalMbps: null,
      effectiveMbps: 10,
      reason: 'ssr',
      perfProfile: 'medium',
    };
  }

  const perfProfile = getCachedPerfProfile();
  const theoreticalMbps = theoreticalMbpsFromSignals();
  const measuredMbps = await measureProbeMbps(signal);

  const effectiveMbps = Math.max(
    0.04,
    Math.min(theoreticalMbps, measuredMbps !== null ? measuredMbps : theoreticalMbps)
  );

  const bytes = getCombinedWasmBytes();
  const downloadSec = (bytes * 8) / (effectiveMbps * 1_000_000);
  const initSec = initOverheadSec(perfProfile);
  let estimatedDownloadSec = downloadSec;
  let estimatedInitSec = initSec;

  if (perfProfile === 'low') {
    estimatedDownloadSec *= 1.12;
    estimatedInitSec += 2;
  }

  const estimatedReadySec = estimatedDownloadSec + estimatedInitSec;

  let autoPreload = true;
  let reason = 'within_budget';

  if (isSaveData()) {
    autoPreload = false;
    reason = 'save_data';
  } else if (estimatedReadySec > CONVERTER_READINESS_BUDGET_SEC) {
    autoPreload = false;
    reason = 'estimated_ready_exceeds_budget';
  }

  return {
    autoPreload,
    estimatedDownloadSec,
    estimatedInitSec,
    estimatedReadySec,
    measuredMbps,
    theoreticalMbps,
    effectiveMbps,
    reason,
    perfProfile,
  };
}

/**
 * Runs probe once per page (or again after connection `change`).
 */
export function getConverterEligibility(signal?: AbortSignal): Promise<ConverterEligibility> {
  if (typeof window === 'undefined') {
    return Promise.resolve({
      autoPreload: true,
      estimatedDownloadSec: 0,
      estimatedInitSec: 0,
      estimatedReadySec: 0,
      measuredMbps: null,
      theoreticalMbps: null,
      effectiveMbps: 10,
      reason: 'ssr',
      perfProfile: 'medium',
    });
  }

  if (eligibilityPromise) return eligibilityPromise;

  const merged = signal ?? new AbortController().signal;

  eligibilityPromise = computeEligibility(merged).catch(() => ({
    autoPreload: true,
    estimatedDownloadSec: 0,
    estimatedInitSec: 0,
    estimatedReadySec: 0,
    measuredMbps: null,
    theoreticalMbps: null,
    effectiveMbps: 1,
    reason: 'probe_failed_default_preload',
    perfProfile: computePerfProfile(),
  }));

  return eligibilityPromise;
}

export function debugLogEligibility(e: ConverterEligibility): void {
  if (typeof process === 'undefined' || process.env.NEXT_PUBLIC_DEBUG_PERF !== '1') return;
  if (typeof console === 'undefined' || typeof console.debug !== 'function') return;
  console.debug('[docxform converter eligibility]', e);
}
