/**
 * Client-side performance tiering: same UI everywhere; tune timeouts, warm-up scheduling,
 * and motion cost from network + device signals (not OS string matching).
 */
import type { Transition } from 'framer-motion';

export type PerfProfile = 'low' | 'medium' | 'high';

let cached: PerfProfile | null = null;
let perfDebugLogged = false;

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
    connection?: { effectiveType?: string; saveData?: boolean };
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

  if (cores <= 2 || (mem !== undefined && mem <= 2)) return 'low';

  if (mobile && mem !== undefined && mem <= 3) return 'low';

  if (!mobile && cores >= 8 && (mem === undefined || mem >= 6) && (et === '4g' || et === '')) {
    return 'high';
  }

  if (!mobile && cores >= 6 && et === '4g') return 'high';

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
        initializeMs: 480_000,
        conversionMs: 240_000,
        wasmProbeMs: 45_000,
      };
    default:
      return {
        initializeMs: 480_000,
        conversionMs: 240_000,
        wasmProbeMs: 45_000,
      };
  }
}

/** `requestIdleCallback` timeout and `setTimeout` fallback for WASM warm-up. */
export function getWarmScheduling(profile: PerfProfile): { idleTimeoutMs: number; fallbackMs: number } {
  switch (profile) {
    case 'low':
      return { idleTimeoutMs: 6000, fallbackMs: 2500 };
    case 'high':
      return { idleTimeoutMs: 1200, fallbackMs: 400 };
    default:
      return { idleTimeoutMs: 1800, fallbackMs: 500 };
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
