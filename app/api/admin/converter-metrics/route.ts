import { NextResponse } from 'next/server';
import { getAdminUserFromCookies } from '@/lib/admin-api-auth';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

export const runtime = 'edge';

export async function GET() {
  const adminUser = await getAdminUserFromCookies();
  if (!adminUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = createSupabaseServiceClient();
    const { data, error } = await client
      .from('converter_metrics')
      .select('id,created_at,event,mode,detail,meta')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      return NextResponse.json({ error: 'Failed to load metrics.', detail: error.message }, { status: 500 });
    }

    const rows = data ?? [];
    const aggregates: Record<string, number> = {};
    for (const row of rows) {
      const e = typeof row.event === 'string' ? row.event : 'unknown';
      aggregates[e] = (aggregates[e] ?? 0) + 1;
    }

    return NextResponse.json({ items: rows, aggregates });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: 'Failed to load metrics.', detail: msg }, { status: 500 });
  }
}
