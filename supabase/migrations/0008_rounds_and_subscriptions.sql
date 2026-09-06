-- Foundational schema for the รอบ (round) + package/payment system. Run
-- this once in the Supabase SQL editor against the already-deployed
-- database. See supabase/schema.sql for the equivalent fresh-install
-- definition and comments explaining each piece.

create table if not exists rounds (
  id uuid primary key default gen_random_uuid(),
  label text not null unique,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index if not exists only_one_active_round on rounds (is_active) where is_active;

create table if not exists round_subscriptions (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references teachers(id) on delete cascade,
  round_id uuid not null references rounds(id) on delete cascade,
  package text not null default 'free' check (package in ('free', 'paid')),
  slip_url text,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (teacher_id, round_id)
);

create index if not exists idx_round_subscriptions_teacher on round_subscriptions (teacher_id);
create index if not exists idx_round_subscriptions_round on round_subscriptions (round_id);

insert into storage.buckets (id, name, public)
values ('payment-slips', 'payment-slips', false)
on conflict (id) do nothing;

alter table rounds enable row level security;
alter table round_subscriptions enable row level security;

-- Create the first round and make it active — replace the label with
-- whatever the current real round should be called.
insert into rounds (label, is_active) values ('2569/1', true)
on conflict (label) do nothing;
