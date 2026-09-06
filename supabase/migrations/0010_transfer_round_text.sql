-- รอบที่ต้องการย้าย now carries which round (1 or 2), not just the year,
-- and is required going forward — stored as "<round>/<year>" e.g. "1/2027".
-- Existing rows only ever held a plain year (e.g. 2027); casting to text
-- preserves them as-is ("2027") rather than guessing a round. The app
-- displays these legacy values as "ปี 2027" instead of "รอบที่ 2027"
-- (see lib/transfer-rounds.ts formatTransferRound).
alter table teachers alter column transfer_round type text using transfer_round::text;
