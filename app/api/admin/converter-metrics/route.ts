import { NextResponse } from 'next/server';
import { getAdminUserFromCookies } from '@/lib/admin-api-auth';
import { restSelect } from '@/lib/supabase-rest';

export const runtime = 'edge';

export async function GET() {
  const adminUser = await getAdminUserFromCookies();
  if (!adminUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const query = new URLSearchParams({
      select: 'id,created_at,event,mode,detail,meta',
      order: 'created_at.desc',
      limit: '200',
    });
    const { data: rows } = await restSelect<{
      id: string;
      created_at: string;
      event: string;
      mode: string | null;
      detail: string | null;
      meta: Record<string, unknown> | null;
    }>('converter_metrics', query);
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
