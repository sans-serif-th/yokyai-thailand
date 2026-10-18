-- Rounds per role (ประเภทผู้ใช้): each role runs its own transfer cycle with
-- its own matching window. Existing rounds belong to 'teacher'.
-- round_subscriptions / favorites reference rounds(id), so they become
-- per-role automatically.
alter table rounds
  add column if not exists category text not null default 'teacher' references categories(code),
  add column if not exists matching_closes_at timestamptz;

-- One active round per role (was: one active round overall).
drop index if exists only_one_active_round;
create unique index only_one_active_round_per_category on rounds (category) where is_active;

-- Labels only need to be unique within a role.
alter table rounds drop constraint if exists rounds_label_key;
alter table rounds add constraint rounds_category_label_key unique (category, label);

alter table rounds
  add constraint rounds_matching_window_check
  check (matching_closes_at is null or matching_opens_at is null or matching_closes_at > matching_opens_at);

notify pgrst, 'reload schema';
