-- A round now has a registration period (when people can sign up) alongside
-- the matching period it already had (matching_opens_at / matching_closes_at,
-- see 0017). The two dates are shown on the registration-phase card in the
-- app ("ลงทะเบียนได้ถึงวันที่ ...", "ประกาศผลการจับคู่ ...") and set in
-- /admin → รอบ. Both are NULL = not scheduled. They are informational: the
-- phase logic (lib/round-phase.ts) still follows the matching dates only.
-- Safe to run more than once.

alter table rounds add column if not exists registration_opens_at timestamptz;
alter table rounds add column if not exists registration_closes_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'rounds_registration_period_check'
  ) then
    alter table rounds add constraint rounds_registration_period_check
      check (
        registration_closes_at is null
        or registration_opens_at is null
        or registration_closes_at > registration_opens_at
      );
  end if;
end $$;
