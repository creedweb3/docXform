import { NextRequest, NextResponse } from 'next/server';
import { getAdminUserFromCookies } from '@/lib/admin-api-auth';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

const VALID_STATUSES = new Set(['new', 'read', 'replied', 'archived']);

function toPositiveInt(value: string | null, fallback: number) {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export async function GET(request: NextRequest) {
  const adminUser = await getAdminUserFromCookies();
  if (!adminUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const search = request.nextUrl.searchParams.get('search')?.trim() ?? '';
  const status = request.nextUrl.searchParams.get('status')?.trim() ?? 'all';
  const page = toPositiveInt(request.nextUrl.searchParams.get('page'), 1);
  const limit = Math.min(25, toPositiveInt(request.nextUrl.searchParams.get('limit'), 12));

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  try {
    const client = createSupabaseServiceClient();
    let query = client
      .from('contact_submissions')
      .select(
        'id,created_at,name,email,message,status,source_page,archived_at,replied_at',
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(from, to);

    if (VALID_STATUSES.has(status)) {
      query = query.eq('status', status);
    }

    if (search.length > 0) {
      const escaped = search.replace(/[%_]/g, '').slice(0, 120);
      query = query.or(`name.ilike.%${escaped}%,email.ilike.%${escaped}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to load submissions.' },
        { status: 500 }
      );
    }

    const items = (data ?? []).map((row) => {
      const preview =
        typeof row.message === 'string' ? row.message.slice(0, 140) : '';

      return {
        id: row.id,
        created_at: row.created_at,
        name: row.name,
        email: row.email,
        status: row.status,
        source_page: row.source_page,
        archived_at: row.archived_at,
        replied_at: row.replied_at,
        preview,
      };
    });

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.max(1, Math.ceil((count ?? 0) / limit)),
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Inbox service is not configured yet.' },
      { status: 500 }
    );
  }
}

