-- teachers.admin_status (added by 0015) was found missing on the real database
-- on 31 Oct 2026, while 0015 was recorded as applied. It backs the outreach
-- status dropdown in /admin. Adds it back exactly as 0015 defined it; every
-- existing row gets the default 'new'. Idempotent: does nothing where the
-- column already exists.
alter table teachers add column if not exists admin_status text not null default 'new';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.teachers'::regclass and conname = 'teachers_admin_status_check'
  ) then
    alter table teachers add constraint teachers_admin_status_check
      check (admin_status in ('new', 'contacted', 'follow_up', 'closed'));
  end if;
end $$;
