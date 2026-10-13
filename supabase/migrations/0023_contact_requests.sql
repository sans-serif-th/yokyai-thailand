-- Contact requests: one teacher asks a matched teacher to share contact
-- details. Name + LINE ID (plus phone / Facebook if filled in) are revealed to
-- BOTH sides only once the target accepts (status = 'accepted'); nothing is
-- shown while pending/declined.
-- Run once in the Supabase SQL editor. See supabase/schema.sql for the
-- equivalent fresh-install definition.

create table if not exists contact_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references teachers(id) on delete cascade,
  target_id uuid not null references teachers(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  unique (requester_id, target_id),
  check (requester_id <> target_id)
);

create index if not exists idx_contact_requests_requester on contact_requests (requester_id);
create index if not exists idx_contact_requests_target on contact_requests (target_id);

-- Default-deny RLS: only the service-role API routes touch this table.
alter table contact_requests enable row level security;
