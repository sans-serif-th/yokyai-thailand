-- Requests from users who could not find their position in the registration
-- form's ตำแหน่ง dropdown ("ขอเพิ่มตำแหน่งในระบบ"). The team reads these in the
-- Supabase table editor to decide which positions to support next. Keyed by
-- LINE user id (not teachers.id) because the user is still registering and has
-- no teachers row yet. RLS stays default-deny: only the server (service role)
-- writes and reads. Safe to run more than once.

create table if not exists position_requests (
  id uuid primary key default gen_random_uuid(),
  line_user_id text not null,
  position_name text not null,
  -- Free text such as "รอบที่ 1 / 2570"; optional.
  transfer_round text,
  criteria text not null,
  -- Agreed to be contacted by the team about this request.
  contact_consent boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists position_requests_created_at_idx on position_requests (created_at desc);

alter table position_requests enable row level security;
