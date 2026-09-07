-- Add verification status tracking: claimed_at timestamp
-- When null: unclaimed seed record (facebook_import source, invite_code IS NOT NULL)
-- When set: verified/claimed account (by owner via /join/<code> or app user)
--
-- Matching logic will filter to only show records where claimed_at IS NOT NULL,
-- ensuring seed records don't appear to real users until they've claimed their profile.

alter table teachers add column claimed_at timestamptz;

-- Existing 'app' source records (real users who signed up) are implicitly verified
-- since they have active LINE accounts. Seed records stay null until claimed.
-- No need to back-populate: app records have a different code path (lib/invites.ts).
