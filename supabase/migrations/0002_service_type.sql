-- Adds service type (สพป./สพม./สอศ.) as a required matching dimension, plus
-- optional zone (เขต) fields. Run this once in the Supabase SQL editor
-- against the already-deployed database. See supabase/schema.sql for the
-- equivalent fresh-install definition.

create table if not exists service_types (
  code text primary key,
  name_th text not null,
  abbr_th text not null
);

insert into service_types (code, name_th, abbr_th) values
  ('primary',    'สำนักงานเขตพื้นที่การศึกษาประถมศึกษา', 'สพป.'),
  ('secondary',  'สำนักงานเขตพื้นที่การศึกษามัธยมศึกษา',  'สพม.'),
  ('vocational', 'สำนักงานคณะกรรมการการอาชีวศึกษา',        'สอศ.')
on conflict (code) do nothing;

alter table service_types enable row level security;

-- Nullable for now: existing rows (if any) have no service_type yet. The
-- app requires it on every new save (see app/api/teachers/route.ts), so in
-- practice it becomes mandatory going forward without a blocking DB
-- constraint on old data. Backfill and add `not null` later if desired.
alter table teachers add column if not exists service_type text references service_types(code);
alter table teachers add column if not exists origin_zone text;
alter table destinations add column if not exists zone text;

create index if not exists idx_teachers_service_type on teachers (service_type);
