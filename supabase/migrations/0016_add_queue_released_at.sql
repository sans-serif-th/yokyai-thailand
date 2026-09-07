-- Queue/usage gate for batched beta rollout: controls whether a user's own
-- visits to matches/favorites are allowed to query for real results. Kept
-- separate from claimed_at (candidate eligibility — whether OTHERS can see
-- this row as a match). Registration itself is never gated by this column;
-- only the matches/favorites read paths check it (see lib/queue.ts).
alter table teachers add column queue_released_at timestamptz;

-- Backfill: every row that exists today already has working access to
-- matches/favorites (there was no queue before this migration) — this
-- feature must never retroactively lock out anyone already using the app.
update teachers set queue_released_at = now() where queue_released_at is null;

-- Backfill claimed_at for existing self-registered ('app' source) rows that
-- were never claimed via an invite. This fixes a bug where every organically
-- self-registered user was invisible as a match candidate to everyone else
-- (claimed_at was only ever set by the invite-claim flow in lib/invites.ts,
-- never by the normal PUT /api/teachers registration path — see
-- 0012_add_claimed_at.sql's comment, which intended app-source rows to be
-- "implicitly verified" but no code ever did it). Uses created_at (not
-- now()) to preserve real registration ordering. A facebook_import row
-- staying null is correct (unclaimed seed, by design).
update teachers
set claimed_at = created_at
where source = 'app' and claimed_at is null;
