import 'server-only';

import { cookies } from 'next/headers';
import { getAdminEntrySlug, getPublicAdminPath, isAllowedAdminEmail } from '@/lib/admin-config';
import { getUserByAccessToken } from '@/lib/supabase-rest';

export const ADMIN_SESSION_COOKIE = 'dx_admin_access_token';

export interface AdminSessionUser {
  id: string;
  email: string;
}

export async function getCurrentAdminUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
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

export function getAdminLoginPathOrFallback() {
  return getPublicAdminPath('login') ?? '/';
}

export function getAdminInboxPathOrFallback() {
  return getPublicAdminPath('inbox') ?? '/';
}

export function getAdminConverterMetricsPathOrFallback() {
  return getPublicAdminPath('converter-metrics') ?? '/';
}

export function isAdminFeatureConfigured() {
  return getAdminEntrySlug() !== null;
}
