export const ADMIN_INTERNAL_PREFIX = '/admin-private';

export const ADMIN_INTERNAL_LOGIN_PATH = `${ADMIN_INTERNAL_PREFIX}/login`;
export const ADMIN_INTERNAL_INBOX_PATH = `${ADMIN_INTERNAL_PREFIX}/inbox`;

function normalizePathToken(value: string) {
  return value.trim().replace(/^\/+|\/+$/g, '');
}

export function getAdminEntrySlug() {
  const value = process.env.ADMIN_ENTRY_SLUG;
  if (!value) return null;

  const normalized = normalizePathToken(value);
  return normalized.length > 0 ? normalized : null;
}

export function getPublicAdminPath(section: 'login' | 'inbox') {
  const slug = getAdminEntrySlug();
  if (!slug) return null;
  return `/${slug}/${section}`;
}

export function getAllowedAdminEmails() {
  const raw = process.env.ADMIN_ALLOWED_EMAILS ?? '';
  return new Set(
    raw
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter((email) => email.length > 0)
  );
}

export function isAllowedAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  return getAllowedAdminEmails().has(email.toLowerCase());
}

export function isPrivateAdminPublicPath(pathname: string) {
  const slug = getAdminEntrySlug();
  if (!slug) return false;
  return pathname === `/${slug}/login` || pathname === `/${slug}/inbox`;
}
