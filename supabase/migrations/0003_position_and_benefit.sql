-- Adds Position (ครูผู้สอน/นักจัดการงานทั่วไป) as a required matching
-- dimension, plus an optional benefit note. Run this once in the Supabase
-- SQL editor against the already-deployed database. See supabase/schema.sql
-- for the equivalent fresh-install definition.

create table if not exists positions (
  code text primary key,
  name_th text not null
);

insert into positions (code, name_th) values
  ('teacher',       'ครูผู้สอน'),
  ('general_admin', 'นักจัดการงานทั่วไป')
on conflict (code) do nothing;

alter table positions enable row level security;

-- Nullable for now, same rationale as 0002_service_type.sql: existing rows
-- have no position yet, and the app requires it on every new save (see
-- app/api/teachers/route.ts).
alter table teachers add column if not exists position text references positions(code);
alter table teachers add column if not exists benefit_note text;

-- teaching_group must become nullable: 'general_admin' rows never have one.
alter table teachers alter column teaching_group drop not null;

create index if not exists idx_teachers_position on teachers (position);
