-- Failed /admin logins, kept so the login route can slow down password
-- guessing (lib/rate-limit.ts). Rows older than a day are deleted by the route.
-- Default-deny RLS: only the server (service role) touches it.
create table if not exists admin_login_attempts (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  ip text not null,
  created_at timestamptz not null default now()
);

create index if not exists admin_login_attempts_ip_created_idx
  on admin_login_attempts (ip, created_at desc);

alter table admin_login_attempts enable row level security;
revoke all on admin_login_attempts from anon, authenticated;
