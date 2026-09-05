-- Yokyai: Teacher mutual-transfer matching system
-- See docs/CONTEXT.md for the domain model these tables implement.

create extension if not exists "pgcrypto";

-- The 8 official teaching groups (กลุ่มสาระการเรียนรู้), 2008 Basic Education Core Curriculum.
create table teaching_groups (
  code text primary key,
  name_th text not null,
  name_en text not null
);

insert into teaching_groups (code, name_th, name_en) values
  ('thai',            'ภาษาไทย',                              'Thai Language'),
  ('math',            'คณิตศาสตร์',                            'Mathematics'),
  ('science',         'วิทยาศาสตร์',                           'Science'),
  ('social',          'สังคมศึกษา ศาสนา และวัฒนธรรม',          'Social Studies, Religion and Culture'),
  ('health_pe',       'สุขศึกษาและพลศึกษา',                    'Health and Physical Education'),
  ('art',             'ศิลปะ',                                'Art'),
  ('occupation_tech', 'การงานและเทคโนโลยี',                    'Occupations and Technology'),
  ('foreign_lang',    'ภาษาต่างประเทศ',                        'Foreign Languages')
on conflict (code) do nothing;

-- Static reference data — no client queries this table directly (the app
-- ships the same list in lib/teaching-groups.ts), so default-deny RLS with
-- no policies is fine, same rationale as teachers/destinations below.
alter table teaching_groups enable row level security;

-- A teacher's profile: who they are, where they are now, and what they teach.
-- Origin is a single required province; a teacher's acceptable destinations
-- live in the `destinations` table (one teacher -> many destination provinces).
create table teachers (
  id uuid primary key default gen_random_uuid(),
  line_user_id text not null unique,
  display_name text not null,

  origin_province text not null,
  origin_district text,       -- optional, informational only (not used for matching)
  current_school text,        -- optional, free text, informational only

  teaching_group text not null references teaching_groups(code),
  subject text,                -- optional exact subject (เอก) within the teaching group, used for filtering only

  service_start_date date,     -- used to warn (not block) on the 24-month eligibility rule

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_teachers_origin_province on teachers (origin_province);
create index idx_teachers_teaching_group on teachers (teaching_group);

-- A teacher's acceptable destination provinces. Optional district narrows
-- display/filtering only; matching itself only ever compares provinces.
create table destinations (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references teachers(id) on delete cascade,
  province text not null,
  district text,
  created_at timestamptz not null default now(),
  unique (teacher_id, province)
);

create index idx_destinations_teacher on destinations (teacher_id);
create index idx_destinations_province on destinations (province);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger teachers_set_updated_at
  before update on teachers
  for each row execute function set_updated_at();

-- Row Level Security: enabled with NO policies for the anon/authenticated
-- roles, i.e. default-deny. The browser never talks to Supabase directly —
-- the client sends its LINE ID token to our Next.js API routes, which verify
-- it server-side and then use the Supabase SERVICE ROLE key (which bypasses
-- RLS) to read/write, scoping every query to that verified line_user_id in
-- application code. RLS here is defense-in-depth against a leaked anon key,
-- not the primary access control.
alter table teachers enable row level security;
alter table destinations enable row level security;
