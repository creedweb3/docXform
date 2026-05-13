import 'server-only';

type SupabaseUser = {
  id: string;
  email?: string | null;
};

export type RestError = {
  message: string;
  status: number;
};

function getSupabaseUrl() {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!value) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable.');
  return value.replace(/\/$/, '');
}

function getSupabasePublishableKey() {
  const value = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!value) throw new Error('Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY).');
  return value;
}

function getSupabaseSecretKey() {
  const value = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!value) throw new Error('Missing SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY).');
  return value;
}

function jsonHeaders(key: string) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  };
}

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  return (text ? JSON.parse(text) : null) as T;
}

async function throwRestError(response: Response): Promise<never> {
  const body = await response.json().catch(() => null);
  const message =
    typeof body?.message === 'string'
      ? body.message
      : typeof body?.error_description === 'string'
        ? body.error_description
        : typeof body?.error === 'string'
          ? body.error
          : `Supabase request failed with HTTP ${response.status}`;
  throw { message, status: response.status } satisfies RestError;
}

export async function signInWithPassword(email: string, password: string) {
  const key = getSupabasePublishableKey();
  const response = await fetch(`${getSupabaseUrl()}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: jsonHeaders(key),
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) await throwRestError(response);
  return parseJson<{
    access_token?: string;
    expires_in?: number;
    expires_at?: number;
    user?: SupabaseUser;
  }>(response);
}

export async function getUserByAccessToken(token: string) {
  const key = getSupabasePublishableKey();
  const response = await fetch(`${getSupabaseUrl()}/auth/v1/user`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) return null;
  const user = await parseJson<SupabaseUser>(response);
  return user?.email ? user : null;
}

export async function restSelect<T>(
  table: string,
  query: URLSearchParams,
  options?: { count?: boolean }
): Promise<{ data: T[]; count: number | null }> {
  const key = getSupabaseSecretKey();
  const url = `${getSupabaseUrl()}/rest/v1/${table}?${query.toString()}`;
  const response = await fetch(url, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      ...(options?.count ? { Prefer: 'count=exact' } : {}),
    },
  });
  if (!response.ok) await throwRestError(response);
  const data = await parseJson<T[]>(response);
  const range = response.headers.get('content-range');
  const count = range?.includes('/') ? Number(range.split('/').at(-1)) : null;
  return { data: data ?? [], count: Number.isFinite(count) ? count : null };
}

export async function restInsert<T>(table: string, rows: unknown): Promise<T[]> {
  const key = getSupabaseSecretKey();
  const response = await fetch(`${getSupabaseUrl()}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      ...jsonHeaders(key),
      Prefer: 'return=representation',
    },
    body: JSON.stringify(rows),
  });
  if (!response.ok) await throwRestError(response);
  return parseJson<T[]>(response);
}

export async function restPatch<T>(table: string, query: URLSearchParams, updates: unknown): Promise<T[]> {
  const key = getSupabaseSecretKey();
  const response = await fetch(`${getSupabaseUrl()}/rest/v1/${table}?${query.toString()}`, {
    method: 'PATCH',
    headers: {
      ...jsonHeaders(key),
      Prefer: 'return=representation',
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) await throwRestError(response);
  return parseJson<T[]>(response);
}

export async function restDelete(table: string, query: URLSearchParams) {
  const key = getSupabaseSecretKey();
  const response = await fetch(`${getSupabaseUrl()}/rest/v1/${table}?${query.toString()}`, {
    method: 'DELETE',
    headers: jsonHeaders(key),
  });
  if (!response.ok) await throwRestError(response);
}
