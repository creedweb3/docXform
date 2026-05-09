import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const ALLOWED_EVENTS = new Set([
  'warm_ready',
  'warm_deferred',
  'warm_failed',
  'convert_success',
  'convert_fail',
  'download',
]);

function getServiceEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  return { url, key };
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const event = typeof body.event === 'string' ? body.event : '';
  if (!ALLOWED_EVENTS.has(event)) {
    return NextResponse.json({ error: 'Invalid event' }, { status: 400 });
  }

  const mode = typeof body.mode === 'string' ? body.mode.slice(0, 32) : null;
  const detail =
    typeof body.detail === 'string' ? body.detail.slice(0, 500) : null;
  const path = typeof body.path === 'string' ? body.path.slice(0, 200) : null;
  const count = typeof body.count === 'number' && Number.isFinite(body.count) ? Math.floor(body.count) : null;
  const ts = typeof body.ts === 'number' ? body.ts : Date.now();

  const { url, key } = getServiceEnv();
  if (!url || !key) {
    return new NextResponse(null, { status: 204 });
  }

  const client = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });

  const { error } = await client.from('converter_metrics').insert({
    event,
    mode,
    detail,
    meta: { path, count, ts },
  });

  if (error) {
    return NextResponse.json({ error: 'Storage failed', detail: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
