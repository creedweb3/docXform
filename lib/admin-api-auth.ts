import 'server-only';

import { cookies } from 'next/headers';
import { ADMIN_SESSION_COOKIE, type AdminSessionUser } from '@/lib/admin-auth';
import { isAllowedAdminEmail } from '@/lib/admin-config';
import { createSupabaseAuthClient } from '@/lib/supabase-server';

export async function getAdminUserFromToken(token: string | null | undefined) {
  if (!token) return null;

  const authClient = createSupabaseAuthClient();
  const { data, error } = await authClient.auth.getUser(token);

  if (error || !data.user?.email) {
    return null;
  }

  if (!isAllowedAdminEmail(data.user.email)) {
    return null;
  }

  return {
    id: data.user.id,
    email: data.user.email,
  } satisfies AdminSessionUser;
}

export async function getAdminUserFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value ?? null;
  return getAdminUserFromToken(token);
}
