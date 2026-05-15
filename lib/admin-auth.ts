import 'server-only';

import { getPublicAdminPath } from '@/lib/admin-config';

export const ADMIN_SESSION_COOKIE = 'dx_admin_access_token';

export interface AdminSessionUser {
  id: string;
  email: string;
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
