-- Lets the team mark a position request as dealt with from /admin/position-requests.
-- Null = still open. Safe to run more than once.

alter table position_requests add column if not exists handled_at timestamptz;
