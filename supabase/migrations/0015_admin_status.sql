-- Internal admin-only outreach tracking (e.g. "we messaged this seed
-- profile about their swap") shown as a dropdown on the Match Coverage
-- page — never surfaced to end users, only in /admin.
alter table teachers add column admin_status text not null default 'new'
  check (admin_status in ('new', 'contacted', 'follow_up', 'closed'));
