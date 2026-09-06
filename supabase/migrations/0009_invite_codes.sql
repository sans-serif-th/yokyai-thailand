-- Adds invite_code so the real person behind a facebook_import seed row
-- can claim it via /join/<code> — admin-delivered only (there's no way for
-- an app user to know who a masked seed candidate is, since we deliberately
-- never expose their Facebook link publicly). Run this once in the
-- Supabase SQL editor against the already-deployed database.

alter table teachers add column if not exists invite_code text;
create unique index if not exists teachers_invite_code_key on teachers (invite_code);

-- Backfill the existing Facebook-imported batch with a code each, so they
-- can be invited right away. 8 random hex chars, collision-safe enough at
-- this volume.
update teachers
set invite_code = encode(gen_random_bytes(4), 'hex')
where source = 'facebook_import' and invite_code is null;

-- Handy admin query to find who to message next, with their invite link
-- ready to paste:
--
-- select display_name, facebook_url,
--        'https://<your-domain>/join/' || invite_code as invite_link
-- from teachers
-- where source = 'facebook_import' and invite_code is not null
-- order by display_name;
