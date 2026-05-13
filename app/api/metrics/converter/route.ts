import { NextRequest, NextResponse } from 'next/server';
import { restInsert } from '@/lib/supabase-rest';

export const runtime = 'edge';

const ALLOWED_EVENTS = new Set([
  'warm_ready',
  'warm_deferred',
  'warm_failed',
  'convert_success',
  'convert_fail',
  'download',
]);

type IncomingEvent = {
  event: string;
  mode?: string | null;
  detail?: string | null;
  path?: string | null;
  count?: number | null;
  ts?: number | null;
};

function normalizeEvent(raw: IncomingEvent) {
  const event = typeof raw.event === 'string' ? raw.event : '';
  if (!ALLOWED_EVENTS.has(event)) return null;
  const mode = typeof raw.mode === 'string' ? raw.mode.slice(0, 32) : null;
  const detail = typeof raw.detail === 'string' ? raw.detail.slice(0, 500) : null;
  const path = typeof raw.path === 'string' ? raw.path.slice(0, 200) : null;
  const count =
    typeof raw.count === 'number' && Number.isFinite(raw.count) ? Math.floor(raw.count) : null;
  const ts = typeof raw.ts === 'number' ? raw.ts : Date.now();
  return { event, mode, detail, path, count, ts };
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const events: IncomingEvent[] = Array.isArray((body as any)?.events)
    ? (body as any).events
    : [(body ?? {}) as IncomingEvent];

  const normalized = events
    .map(normalizeEvent)
    .filter((v): v is NonNullable<ReturnType<typeof normalizeEvent>> => Boolean(v));

  if (!normalized.length) {
    return NextResponse.json({ error: 'Invalid event' }, { status: 400 });
  }

  const rows = normalized.map(({ event, mode, detail, path, count, ts }) => ({
    event,
    mode,
    detail,
    meta: { path, count, ts },
  }));

  // Best-effort: previews often lack schema/RLS; keep the client silent (no 500 spam).
  try {
    await restInsert('converter_metrics', rows);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      const message = error instanceof Error ? error.message : String(error);
      console.warn('[converter metrics] insert failed', message);
    }
    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.json({ ok: true });
}
