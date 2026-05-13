import { NextRequest, NextResponse } from 'next/server';
import { getAdminUserFromCookies } from '@/lib/admin-api-auth';
import { restSelect } from '@/lib/supabase-rest';

export const runtime = 'edge';

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
    const query = new URLSearchParams({
      select: 'id,created_at,name,email,message,status,source_page,archived_at,replied_at',
      order: 'created_at.desc',
      offset: String(from),
      limit: String(to - from + 1),
    });

    if (VALID_STATUSES.has(status)) {
      query.set('status', `eq.${status}`);
    }

    if (search.length > 0) {
      const escaped = search.replace(/[%_]/g, '').slice(0, 120);
      query.set('or', `(name.ilike.*${escaped}*,email.ilike.*${escaped}*)`);
    }

    const { data, count } = await restSelect<{
      id: string;
      created_at: string;
      name: string;
      email: string;
      message: string;
      status: 'new' | 'read' | 'replied' | 'archived';
      source_page?: string | null;
      archived_at?: string | null;
      replied_at?: string | null;
    }>('contact_submissions', query, { count: true });

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

