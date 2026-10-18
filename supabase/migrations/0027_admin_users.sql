-- Back-office logins (username + password). Passwords are scrypt hashes —
-- see lib/admin-password.ts; seed the first row with
-- scripts/hash-admin-password.mjs. Only the service role reads this table, so
-- RLS is enabled with no policies (default-deny), like teachers.
create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique check (username ~ '^[a-z0-9._-]{3,32}$'),
  password_hash text not null,
  created_at timestamptz not null default now()
);

alter table admin_users enable row level security;
