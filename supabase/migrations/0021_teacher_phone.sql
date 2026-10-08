-- Optional contact phone number, collected on the onboarding wizard's
-- ข้อมูลติดต่อ step (2026-10 Figma update) in place of the Facebook link
-- field. facebook_url stays in the table — existing imported/claimed rows
-- keep theirs — it's just no longer asked for in the app's forms.
alter table teachers add column if not exists phone text;
