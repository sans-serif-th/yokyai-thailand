-- Admin-managed master list of subjects (วิชาเอก), scoped to a teaching group
-- (e.g. "เอกคณิตศาสตร์" belongs to teaching_group 'math'). Unlike
-- teaching_groups/service_types/positions/categories, this table is not a
-- fixed enum baked into app code — admins add/edit/delete rows via
-- /admin/master-data, and the teachers.subject column stays free text for
-- now (existing values are not migrated onto this table automatically).
create table subjects (
  id uuid primary key default gen_random_uuid(),
  teaching_group text not null references teaching_groups(code),
  name_th text not null,
  created_at timestamptz not null default now(),
  unique (teaching_group, name_th)
);

create index idx_subjects_teaching_group on subjects (teaching_group);

-- Default-deny RLS — same rationale as other reference tables: only
-- server-side admin routes (service role key) read/write this table.
alter table subjects enable row level security;
