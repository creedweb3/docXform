import 'server-only';

import { cookies } from 'next/headers';
import { ADMIN_SESSION_COOKIE, type AdminSessionUser } from '@/lib/admin-auth';
import { isAllowedAdminEmail } from '@/lib/admin-config';
import { getUserByAccessToken } from '@/lib/supabase-rest';

export async function getAdminUserFromToken(token: string | null | undefined) {
  if (!token) return null;

  const user = await getUserByAccessToken(token);
  if (!user?.email) {
    return null;
  }

  if (!isAllowedAdminEmail(user.email)) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
  } satisfies AdminSessionUser;
}

export async function getAdminUserFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value ?? null;
  return getAdminUserFromToken(token);
}
