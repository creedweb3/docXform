export const ADMIN_INTERNAL_PREFIX = '/admin-private';

function normalizePathToken(value: string) {
  return value.trim().replace(/^\/+|\/+$/g, '');
}

export function getAdminEntrySlug() {
  const value = process.env.ADMIN_ENTRY_SLUG;
  if (!value) return null;

  const normalized = normalizePathToken(value);
  return normalized.length > 0 ? normalized : null;
}

export function getPublicAdminPath(section: 'login' | 'inbox' | 'converter-metrics') {
  const slug = getAdminEntrySlug();
  if (!slug) return null;
  if (section === 'login') return `/${slug}/login`;
  if (section === 'inbox') return `/${slug}/inbox`;
  return `/${slug}/converter-metrics`;
}

function getAllowedAdminEmails() {
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
