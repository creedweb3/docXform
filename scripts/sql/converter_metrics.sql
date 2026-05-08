-- Run in Supabase SQL editor (or migration) before using converter metrics + admin feed.
-- RLS: no public policies; only service role (server routes) reads/writes.

create table if not exists public.converter_metrics (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event text not null,
  mode text,
  detail text,
  meta jsonb not null default '{}'::jsonb
);

create index if not exists converter_metrics_created_at_idx on public.converter_metrics (created_at desc);
create index if not exists converter_metrics_event_idx on public.converter_metrics (event);

alter table public.converter_metrics enable row level security;

-- No policies: anon/authenticated cannot access; service role bypasses RLS.
