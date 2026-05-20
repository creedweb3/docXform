'use client';

type ConverterMetricEvent =
  | 'warm_ready'
  | 'warm_deferred'
  | 'warm_failed'
  | 'convert_success'
  | 'convert_fail'
  | 'download';

/**
 * Fire-and-forget client → `/api/metrics/converter`. When Supabase is not configured,
 * the API returns 204; insert failures also return 204 so previews stay quiet.
 */
type MetricPayload = {
  event: ConverterMetricEvent;
  mode?: string;
  detail?: string;
  count?: number;
};

let queue: Array<MetricPayload & { path: string; ts: number }> = [];
let flushTimer: number | null = null;

function flush() {
  if (typeof window === 'undefined') return;
  if (!queue.length) return;
  const batch = queue;
  queue = [];
  if (flushTimer !== null) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  const body = JSON.stringify({ events: batch });
  void fetch('/api/metrics/converter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {});
}

function scheduleFlush() {
  if (flushTimer !== null) return;
  const idle = (window as any).requestIdleCallback as
    | ((cb: () => void, opts?: { timeout?: number }) => number)
    | undefined;
  if (idle) {
    flushTimer = idle(() => {
      flushTimer = null;
      flush();
    }, { timeout: 400 });
  } else {
    flushTimer = window.setTimeout(() => {
      flushTimer = null;
      flush();
    }, 400);
  }
}

export function reportConverterMetric(payload: MetricPayload): void {
  if (typeof window === 'undefined') return;
  queue.push({
    ...payload,
    path: window.location.pathname,
    ts: Date.now(),
  });
  scheduleFlush();
}
