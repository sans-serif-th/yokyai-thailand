-- Adds a `source` column so the app can tell self-entered profiles apart
-- from rows seeded from public Facebook comments, and backfills the batch
-- imported earlier. Run this once in the Supabase SQL editor against the
-- already-deployed database. See supabase/schema.sql for the equivalent
-- fresh-install definition.

alter table teachers add column if not exists source text not null default 'app';
alter table teachers drop constraint if exists teachers_source_check;
alter table teachers add constraint teachers_source_check check (source in ('app', 'facebook_import'));

update teachers set source = 'facebook_import' where line_user_id like 'seed:fb:%';
