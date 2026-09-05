-- Replaces service_start_date (and the 24-month tenure warning it fed) with
-- transfer_round: which year's transfer cycle the applicant wants to move
-- in (e.g. 2027). Also caps benefit_note at 500 characters at the DB level,
-- matching the app-level check in app/api/teachers/route.ts. Run this once
-- in the Supabase SQL editor against the already-deployed database. See
-- supabase/schema.sql for the equivalent fresh-install definition.

alter table teachers drop column if exists service_start_date;
alter table teachers add column if not exists transfer_round integer;

alter table teachers drop constraint if exists teachers_benefit_note_check;
alter table teachers add constraint teachers_benefit_note_check check (char_length(benefit_note) <= 500);
