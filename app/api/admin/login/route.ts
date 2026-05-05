import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE } from '@/lib/admin-auth';
import { getPublicAdminPath, isAllowedAdminEmail } from '@/lib/admin-config';
import { createSupabaseAuthClient } from '@/lib/supabase-server';

function normalize(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 }
    );
  }

  const body = (payload ?? {}) as Record<string, unknown>;
  const email = normalize(body.email).toLowerCase();
  const password = normalize(body.password);

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required.' },
      { status: 400 }
    );
  }

  try {
    const authClient = createSupabaseAuthClient();
    const { data, error } = await authClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session?.access_token || !data.user?.email) {
      return NextResponse.json(
        { error: 'Invalid credentials.' },
        { status: 401 }
      );
    }

    if (!isAllowedAdminEmail(data.user.email)) {
      return NextResponse.json(
        { error: 'This account is not authorized for admin access.' },
        { status: 403 }
      );
    }

    const nowInSeconds = Math.floor(Date.now() / 1000);
    const expiresAt = data.session.expires_at ?? nowInSeconds + 3600;
    const maxAge = Math.max(60, expiresAt - nowInSeconds);

    const cookieStore = await cookies();
    cookieStore.set({
      name: ADMIN_SESSION_COOKIE,
      value: data.session.access_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    });

    return NextResponse.json({
      ok: true,
      redirectTo: getPublicAdminPath('inbox') ?? '/',
    });
  } catch {
    return NextResponse.json(
      { error: 'Auth service is not configured yet.' },
      { status: 500 }
    );
  }
}
