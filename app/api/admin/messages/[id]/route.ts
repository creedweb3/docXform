import { NextRequest, NextResponse } from 'next/server';
import { getAdminUserFromCookies } from '@/lib/admin-api-auth';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

const VALID_STATUSES = new Set(['new', 'read', 'replied', 'archived']);

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const adminUser = await getAdminUserFromCookies();
  if (!adminUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const client = createSupabaseServiceClient();
    const { data, error } = await client
      .from('contact_submissions')
      .select(
        'id,created_at,name,email,message,status,source_page,archived_at,replied_at,user_agent'
      )
      .eq('id', id)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to load submission.' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    }

    return NextResponse.json({ item: data });
  } catch {
    return NextResponse.json(
      { error: 'Inbox service is not configured yet.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const adminUser = await getAdminUserFromCookies();
  if (!adminUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const status =
    typeof (payload as Record<string, unknown>).status === 'string'
      ? ((payload as Record<string, unknown>).status as string).trim()
      : '';

  if (!VALID_STATUSES.has(status)) {
    return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
  }

  const updates: Record<string, unknown> = {
    status,
  };

  if (status === 'archived') {
    updates.archived_at = new Date().toISOString();
  } else {
    updates.archived_at = null;
  }

  if (status === 'replied') {
    updates.replied_at = new Date().toISOString();
  }

  try {
    const { id } = await params;
    const client = createSupabaseServiceClient();
    const { data, error } = await client
      .from('contact_submissions')
      .update(updates)
      .eq('id', id)
      .select('id,status,archived_at,replied_at')
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update submission.' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    }

    return NextResponse.json({ item: data });
  } catch {
    return NextResponse.json(
      { error: 'Inbox service is not configured yet.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext
) {
  const adminUser = await getAdminUserFromCookies();
  if (!adminUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const client = createSupabaseServiceClient();
    const { error } = await client
      .from('contact_submissions')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete submission.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: 'Inbox service is not configured yet.' },
      { status: 500 }
    );
  }
}
