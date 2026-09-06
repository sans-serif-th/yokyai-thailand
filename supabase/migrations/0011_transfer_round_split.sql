-- Supersedes 0010: รอบที่ต้องการย้าย is kept as two separate values instead
-- of one combined "<round>/<year>" string — transfer_round now holds just
-- "1" or "2", paired with a new transfer_year column.
--
-- Safe to run whether or not 0010 has been applied yet:
--   - if transfer_round is still integer (0010 not run), the cast below
--     makes it text first;
--   - any rows already saved in 0010's "1/2027" combined format get split;
--   - older rows that only ever held a plain year (e.g. "2027", from before
--     the round concept existed) move that value into transfer_year and
--     leave transfer_round null, since the round was never captured.
alter table teachers alter column transfer_round type text using transfer_round::text;
alter table teachers add column if not exists transfer_year integer;

update teachers
set transfer_year = split_part(transfer_round, '/', 2)::int,
    transfer_round = split_part(transfer_round, '/', 1)
where transfer_round ~ '^[12]/\d{4}$';

update teachers
set transfer_year = transfer_round::int,
    transfer_round = null
where transfer_round ~ '^\d{4}$';
