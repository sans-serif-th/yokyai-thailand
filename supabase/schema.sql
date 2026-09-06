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

-- The 3 service types (administrative systems) relevant to teacher
-- transfers. A teacher can only swap with someone in the same service
-- type — see lib/service-types.ts (must stay in sync).
create table service_types (
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

-- The 2 positions (ตำแหน่ง) eligible for mutual transfer via this system.
-- Only 'teacher' has a Teaching Group / Subject — see lib/positions.ts
-- (must stay in sync).
create table positions (
  code text primary key,
  name_th text not null
);

insert into positions (code, name_th) values
  ('teacher',       'ครูผู้สอน'),
  ('general_admin', 'นักจัดการงานทั่วไป')
on conflict (code) do nothing;

alter table positions enable row level security;

-- A teacher's profile: who they are, where they are now, and what they teach.
-- Origin is a single required province; a teacher's acceptable destinations
-- live in the `destinations` table (one teacher -> many destination provinces).
create table teachers (
  id uuid primary key default gen_random_uuid(),
  line_user_id text not null unique,
  display_name text not null,

  position text not null references positions(code),
  service_type text not null references service_types(code),

  origin_province text not null,
  origin_district text,       -- optional, informational only (not used for matching)
  origin_zone text,           -- optional, informational only (e.g. "เขต 1") — not standardized across provinces, so free text
  current_school text,        -- optional, free text, informational only

  -- Only required when position = 'teacher' (enforced in application code,
  -- not a DB constraint, since 'general_admin' rows must leave this null).
  teaching_group text references teaching_groups(code),
  subject text,                -- optional exact subject (เอก) within the teaching group, used for filtering only

  benefit_note text check (char_length(benefit_note) <= 500), -- optional, free text (e.g. "มีบ้านพักครู") — informational only, not used for matching

  transfer_round integer,      -- optional, the year (e.g. 2027) the applicant wants to move in — informational only, not used for matching

  facebook_url text,           -- optional, an alternate contact route shown on match cards alongside LINE — informational only, not used for matching

  -- 'app': signed up via LINE themselves. 'facebook_import': seeded from a
  -- public Facebook post/comment, never logged into — display_name is
  -- masked (PDPA) whenever shown to anyone other than the row itself, and
  -- match cards tag these so a real user knows the data wasn't self-entered.
  source text not null default 'app' check (source in ('app', 'facebook_import')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_teachers_origin_province on teachers (origin_province);
create index idx_teachers_teaching_group on teachers (teaching_group);
create index idx_teachers_service_type on teachers (service_type);
create index idx_teachers_position on teachers (position);

-- A teacher's acceptable destination provinces. Optional district/zone
-- narrow display/filtering only; matching itself only ever compares
-- provinces (plus service_type, checked on the teacher row).
create table destinations (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references teachers(id) on delete cascade,
  province text not null,
  district text,
  zone text,
  created_at timestamptz not null default now(),
  unique (teacher_id, province)
);

create index idx_destinations_teacher on destinations (teacher_id);
create index idx_destinations_province on destinations (province);

-- A teacher saving another teacher's match card for later. Direction matters
-- (teacher_id favorited favorited_teacher_id) — favoriting is not mutual.
create table favorites (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references teachers(id) on delete cascade,
  favorited_teacher_id uuid not null references teachers(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (teacher_id, favorited_teacher_id),
  check (teacher_id != favorited_teacher_id)
);

create index idx_favorites_teacher on favorites (teacher_id);

-- A transfer cycle (e.g. "2569/1", "2569/2"). Payment and package limits
-- are scoped to whichever round is currently active — a teacher's profile
-- and destinations persist across rounds regardless (see
-- round_subscriptions below for what actually resets).
create table rounds (
  id uuid primary key default gen_random_uuid(),
  label text not null unique,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

-- At most one round can be active at a time — a partial unique index on a
-- boolean column that's only indexed where true works because every
-- indexed row then shares the same value, so a second true row collides.
create unique index only_one_active_round on rounds (is_active) where is_active;

-- A teacher's package for one specific round. Free = 1 destination allowed
-- that round; paid = 3, but only once verified_at is set (uploading a slip
-- alone doesn't unlock anything — see slip_url). Admin verification is
-- manual for the MVP: check the uploaded slip in Storage, then set
-- verified_at directly via SQL — no in-app admin UI yet.
create table round_subscriptions (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references teachers(id) on delete cascade,
  round_id uuid not null references rounds(id) on delete cascade,
  package text not null default 'free' check (package in ('free', 'paid')),
  slip_url text,                  -- Storage object path for the uploaded PromptPay slip
  verified_at timestamptz,        -- null = pending/unverified; set by admin after manual check
  created_at timestamptz not null default now(),
  unique (teacher_id, round_id)
);

create index idx_round_subscriptions_teacher on round_subscriptions (teacher_id);
create index idx_round_subscriptions_round on round_subscriptions (round_id);

-- Storage bucket for uploaded payment slips. Private (not public) — the
-- app only ever writes to it server-side with the service role key, and
-- the admin views slips directly in the Supabase dashboard's Storage
-- browser, so no client-facing read policy is needed either.
insert into storage.buckets (id, name, public)
values ('payment-slips', 'payment-slips', false)
on conflict (id) do nothing;

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
alter table favorites enable row level security;
alter table rounds enable row level security;
alter table round_subscriptions enable row level security;
