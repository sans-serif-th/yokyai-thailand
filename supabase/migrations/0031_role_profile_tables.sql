-- Role-specific registration data lives in one extension table per role,
-- keyed by the shared teachers row (teachers stays the core table that
-- destinations, favorites, contact_requests and round_subscriptions point at).
--
-- 1) position / service_type are teacher-only concepts: allow NULL for other
--    roles, but keep them mandatory for teachers.
alter table teachers alter column position drop not null;
alter table teachers alter column service_type drop not null;
alter table teachers
  add constraint teachers_teacher_fields_check
  check (category <> 'teacher' or (position is not null and service_type is not null));

create index if not exists teachers_category_idx on teachers (category);

-- 2) Extension table for the example role 'demo' (see docs/adding-a-role.md).
--    Inert unless a 'demo' role is switched on; the service role only.
create table demo_profiles (
  teacher_id uuid primary key references teachers(id) on delete cascade,
  specialty text,
  years_experience integer check (years_experience between 0 and 60),
  workplace text
);
alter table demo_profiles enable row level security;

notify pgrst, 'reload schema';
