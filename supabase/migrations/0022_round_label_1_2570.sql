-- The active round is now "1/2570" (รอบที่ 1 ปี พ.ศ. 2570), matching the
-- transfer-round options offered in the forms (see lib/transfer-rounds.ts).
-- Shown as "รอบ 1/2570" on the matching tabs. If no round exists yet this is
-- a no-op — create one from /admin's round tab instead.
-- (label is unique, so skip if another round already uses it.)
update rounds set label = '1/2570'
where is_active
  and not exists (select 1 from rounds where label = '1/2570' and not is_active);
