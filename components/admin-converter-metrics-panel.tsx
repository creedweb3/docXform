'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { IconRefresh } from '@/components/icons';
import { AdminBrandHeader } from '@/components/admin-brand-header';

interface MetricRow {
  id: string;
  created_at: string;
  event: string;
  mode: string | null;
  detail: string | null;
  meta: Record<string, unknown> | null;
}

interface MetricsResponse {
  items: MetricRow[];
  aggregates: Record<string, number>;
}

function formatTime(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

export function AdminConverterMetricsPanel({
  loginPath,
  inboxPath,
  converterMetricsPath,
  adminEmail,
}: {
  loginPath: string;
  inboxPath: string;
  converterMetricsPath: string;
  adminEmail: string;
}) {
  const [data, setData] = useState<MetricsResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } finally {
      window.location.href = loginPath;
    }
  }, [loginPath]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/converter-metrics', { credentials: 'include' });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(typeof j.error === 'string' ? j.error : `HTTP ${res.status}`);
        setData(null);
        return;
      }
      setData((await res.json()) as MetricsResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initial = window.setTimeout(() => void load(), 0);
    const id = window.setInterval(() => void load(), 8000);
    return () => {
      clearTimeout(initial);
      clearInterval(id);
    };
  }, [load]);

  const orderedAggregates = useMemo(() => {
    if (!data?.aggregates) return [];
    return Object.entries(data.aggregates).sort((a, b) => b[1] - a[1]);
  }, [data]);

  return (
    <div className="space-y-4">
      <AdminBrandHeader
        inboxPath={inboxPath}
        identityLabel={adminEmail}
        inboxActive={false}
        converterMetricsPath={converterMetricsPath}
        converterMetricsActive
        showLogout
        onLogout={() => void handleLogout()}
      />

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border/40 bg-white/70 px-4 py-3">
        <h1 className="text-lg font-semibold text-foreground">Converter metrics (live)</h1>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-white/80 px-3 py-1.5 text-xs font-medium hover:bg-white disabled:opacity-50"
        >
          <IconRefresh size={14} strokeWidth={2} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      ) : null}

      {data && orderedAggregates.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {orderedAggregates.map(([event, count]) => (
            <div
              key={event}
              className="rounded-xl border border-border/40 bg-white/80 px-4 py-3 shadow-sm"
            >
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{event}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{count}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="rounded-2xl border border-border/40 bg-white/80 overflow-hidden">
        <div className="border-b border-border/30 bg-slate-50/80 px-4 py-2 text-xs font-medium text-muted-foreground">
          Last {data?.items.length ?? 0} events (newest first)
        </div>
        <div className="max-h-[60vh] overflow-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-white/95 backdrop-blur border-b border-border/30">
              <tr>
                <th className="px-3 py-2 font-medium">Time</th>
                <th className="px-3 py-2 font-medium">Event</th>
                <th className="px-3 py-2 font-medium">Mode</th>
                <th className="px-3 py-2 font-medium">Detail</th>
              </tr>
            </thead>
            <tbody>
              {(data?.items ?? []).map((row) => (
                <tr key={row.id} className="border-b border-border/20 hover:bg-slate-50/60">
                  <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">{formatTime(row.created_at)}</td>
                  <td className="px-3 py-2 font-mono">{row.event}</td>
                  <td className="px-3 py-2">{row.mode ?? '—'}</td>
                  <td className="px-3 py-2 max-w-[240px] truncate" title={row.detail ?? ''}>
                    {row.detail ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && (data?.items.length ?? 0) === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              No rows yet. Run scripts/sql/converter_metrics.sql in Supabase, then use the site converter to emit
              events.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
