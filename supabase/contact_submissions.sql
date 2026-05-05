create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc'::text, now()),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) <= 320),
  message text not null check (char_length(message) between 10 and 4000),
  status text not null default 'new' check (status in ('new', 'read', 'replied', 'archived')),
  source_page text,
  ip_hash text,
  user_agent text,
  archived_at timestamptz,
  replied_at timestamptz
);

create index if not exists contact_submissions_created_at_idx
  on public.contact_submissions (created_at desc);

create index if not exists contact_submissions_status_idx
  on public.contact_submissions (status);

create index if not exists contact_submissions_email_idx
  on public.contact_submissions (lower(email));

alter table public.contact_submissions enable row level security;

