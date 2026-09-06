-- Adds an optional Facebook profile link as an alternate contact route on
-- match cards. Run this once in the Supabase SQL editor against the
-- already-deployed database. See supabase/schema.sql for the equivalent
-- fresh-install definition.

alter table teachers add column if not exists facebook_url text;
