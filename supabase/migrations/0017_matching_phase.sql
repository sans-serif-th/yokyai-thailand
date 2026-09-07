-- Removes the per-user batched-rollout queue (queue_released_at), replaced
-- by a GLOBAL registration-period / matching-phase gate on the active
-- round. See lib/rounds.ts (isRoundInMatchingPhase) and lib/matching.ts
-- (findMatchesFor's early-return). Confirmed via full-repo grep that
-- nothing references queue_released_at after removing lib/queue.ts,
-- app/api/queue/route.ts, app/api/admin/queue/release/route.ts, and
-- components/queue-waiting.tsx.
alter table teachers drop column if exists queue_released_at;

-- NULL = registration/dashboard-only phase, indefinitely (or "not yet
-- scheduled"). A timestamp <= now() = matching phase is open; a future
-- timestamp = scheduled to open then. The same field serves both a
-- schedule and an immediate manual open (admin just sets it to "now").
alter table rounds add column matching_opens_at timestamptz;
