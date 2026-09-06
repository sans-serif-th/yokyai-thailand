-- Adds the "รายการโปรด" (favorites) feature: a teacher can save another
-- teacher's match card for later. Run this once in the Supabase SQL editor
-- against the already-deployed database. See supabase/schema.sql for the
-- equivalent fresh-install definition.

create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references teachers(id) on delete cascade,
  favorited_teacher_id uuid not null references teachers(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (teacher_id, favorited_teacher_id),
  check (teacher_id != favorited_teacher_id)
);

create index if not exists idx_favorites_teacher on favorites (teacher_id);

alter table favorites enable row level security;
