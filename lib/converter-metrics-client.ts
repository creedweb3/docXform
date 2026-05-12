'use client';

export type ConverterMetricEvent =
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
export function reportConverterMetric(payload: {
  event: ConverterMetricEvent;
  mode?: string;
  detail?: string;
  count?: number;
}): void {
  if (typeof window === 'undefined') return;
  const body = JSON.stringify({
    ...payload,
    path: window.location.pathname,
    ts: Date.now(),
  });
  void fetch('/api/metrics/converter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {});
}
