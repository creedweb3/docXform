/**
 * Client-side performance tiering: same UI everywhere; tune timeouts, warm-up scheduling,
 * and motion cost from network + device signals (not OS string matching).
 */
import type { Transition } from 'framer-motion';

export type PerfProfile = 'low' | 'medium' | 'high';

let cached: PerfProfile | null = null;
let perfDebugLogged = false;

/** Call when `navigator.connection` changes so tiering and warm-up match the new link. */
export function invalidatePerfProfileCache(): void {
  cached = null;
  perfDebugLogged = false;
}

function isPerfDebugEnabled(): boolean {
  return (
    typeof process !== 'undefined' &&
    process.env.NEXT_PUBLIC_DEBUG_PERF === '1'
  );
}

function perfDebugSnapshot(profile: PerfProfile): Record<string, unknown> {
  if (typeof navigator === 'undefined') {
    return { profile };
  }
  const nav = navigator as Navigator & {
    connection?: { effectiveType?: string; saveData?: boolean; downlink?: number };
    deviceMemory?: number;
    userAgentData?: { mobile?: boolean };
  };
  const reducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return {
    profile,
    effectiveType: nav.connection?.effectiveType ?? null,
    downlink: nav.connection?.downlink ?? null,
    saveData: Boolean(nav.connection?.saveData),
    hardwareConcurrency: nav.hardwareConcurrency ?? null,
    deviceMemoryGb: nav.deviceMemory ?? null,
    coarseMobile: isCoarseMobile(),
    prefersReducedMotion: reducedMotion,
  };
}

function maybeLogPerfProfile(profile: PerfProfile): void {
  if (!isPerfDebugEnabled() || perfDebugLogged || typeof window === 'undefined') return;
  perfDebugLogged = true;
  const timeouts = getConverterTimeouts(profile);
  const warm = getWarmScheduling(profile);
  console.debug('[docxform perf]', perfDebugSnapshot(profile), { timeouts, warm });
}

function effectiveType(): string {
  if (typeof navigator === 'undefined') return '';
  const conn = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection;
  return conn?.effectiveType ?? '';
}

function connectionDownlinkMbps(): number | null {
  if (typeof navigator === 'undefined') return null;
  const c = (navigator as Navigator & { connection?: { downlink?: number } }).connection;
  if (c && typeof c.downlink === 'number' && c.downlink > 0 && Number.isFinite(c.downlink)) {
    return c.downlink;
  }
  return null;
}

function isSaveData(): boolean {
  if (typeof navigator === 'undefined') return false;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return Boolean(conn?.saveData);
}

function isCoarseMobile(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & { userAgentData?: { mobile?: boolean } };
  if (typeof nav.userAgentData?.mobile === 'boolean') return nav.userAgentData.mobile;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(nav.userAgent);
}

/**
 * Compute once per page load; safe to call from client components and `'use client'` modules.
 * Uses connection downlink when present to separate "fast phone, slow data" from desktop Wi‑Fi.
 */
export function computePerfProfile(): PerfProfile {
  if (typeof window === 'undefined') return 'medium';

  const et = effectiveType();
  if (isSaveData()) return 'low';
  if (et === 'slow-2g' || et === '2g' || et === '3g') return 'low';

  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency ?? 4;
  const mem = nav.deviceMemory;
  const mobile = isCoarseMobile();
  const downlink = connectionDownlinkMbps();

  if (cores <= 2 || (mem !== undefined && mem <= 2)) return 'low';

  if (mobile && mem !== undefined && mem <= 3) return 'low';

  // Fast device but slow pipe (common on 4G label with poor real throughput).
  if (downlink !== null && downlink < 1.5 && (cores >= 4 || !mobile)) return 'low';

  if (!mobile && cores >= 8 && (mem === undefined || mem >= 6) && (et === '4g' || et === '')) {
    if (downlink === null || downlink >= 5) return 'high';
    return 'medium';
  }

  if (!mobile && cores >= 6 && et === '4g') {
    if (downlink === null || downlink >= 4) return 'high';
    return 'medium';
  }

  if (mobile && cores >= 6 && (downlink === null || downlink >= 4) && (et === '4g' || et === '')) {
    return 'high';
  }

  return 'medium';
}

export function getCachedPerfProfile(): PerfProfile {
  if (cached !== null) return cached;
  cached = computePerfProfile();
  maybeLogPerfProfile(cached);
  return cached;
}

export interface ConverterTimeouts {
  initializeMs: number;
  conversionMs: number;
  wasmProbeMs: number;
}

export function getConverterTimeouts(profile: PerfProfile): ConverterTimeouts {
  /**
   * LibreOffice WASM + .data are very large. DevTools “Slow/Fast 4G” usually does **not**
   * change `navigator.connection.effectiveType`, so “high” tier must not use short init
   * caps — otherwise warm-up appears stuck or fails while bytes are still downloading.
   */
  switch (profile) {
    case 'low':
      return {
        initializeMs: 600_000,
        conversionMs: 360_000,
        wasmProbeMs: 60_000,
      };
    case 'high':
      return {
        initializeMs: 540_000,
        conversionMs: 270_000,
        wasmProbeMs: 50_000,
      };
    default:
      return {
        initializeMs: 480_000,
        conversionMs: 240_000,
        wasmProbeMs: 45_000,
      };
  }
}

/**
 * `requestIdleCallback` timeout and `setTimeout` fallback for WASM warm-up.
 * Timeout is the worst-case wait when the main thread stays busy (e.g. hydration);
 * keep it modest so "Preparing converter" does not sit idle for many seconds before work starts.
 */
export function getWarmScheduling(profile: PerfProfile): { idleTimeoutMs: number; fallbackMs: number } {
  switch (profile) {
    case 'low':
      return { idleTimeoutMs: 2000, fallbackMs: 800 };
    case 'high':
      return { idleTimeoutMs: 400, fallbackMs: 200 };
    default:
      return { idleTimeoutMs: 800, fallbackMs: 350 };
  }
}

export interface MotionBudget {
  spring: Transition;
  chipMotion: Transition;
  /** Slightly longer motion for queue row expand/collapse */
  rowExpand: Transition;
}

const chipEase = [0.25, 0.46, 0.45, 0.94] as const;

/**
 * Same layout and components; only animation cost changes. Respects prefers-reduced-motion.
 */
export function getMotionBudget(profile: PerfProfile, reducedMotion: boolean): MotionBudget {
  if (reducedMotion) {
    return {
      spring: { duration: 0.12, ease: chipEase },
      chipMotion: { duration: 0.1, ease: chipEase },
      rowExpand: { duration: 0.12, ease: chipEase },
    };
  }

  switch (profile) {
    case 'low':
      return {
        spring: { type: 'spring', stiffness: 220, damping: 34 },
        chipMotion: { duration: 0.16, ease: chipEase },
        rowExpand: { duration: 0.22, ease: chipEase },
      };
    case 'high':
      return {
        spring: { type: 'spring', stiffness: 340, damping: 28 },
        chipMotion: { duration: 0.18, ease: chipEase },
        rowExpand: { duration: 0.32, ease: chipEase },
      };
    default:
      return {
        spring: { type: 'spring', stiffness: 300, damping: 30 },
        chipMotion: { duration: 0.2, ease: chipEase },
        rowExpand: { duration: 0.28, ease: chipEase },
      };
  }
}
