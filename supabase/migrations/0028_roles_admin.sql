-- Admin-managed roles (ประเภทผู้ใช้). `status` controls what the welcome
-- screen shows: 'active' = selectable, 'coming_soon' = listed as "เร็วๆนี้",
-- 'hidden' = not shown. A role can only be set 'active' from /admin/roles if
-- code for it is registered in lib/roles/index.ts. Same RLS as before:
-- default-deny, read through the service role.
alter table categories
  add column if not exists status text not null default 'hidden'
    check (status in ('active', 'coming_soon', 'hidden')),
  add column if not exists sort_order int not null default 0;

update categories set status = 'active',      sort_order = 0 where code = 'teacher';
update categories set status = 'coming_soon', sort_order = 1 where code = 'nurse';
update categories set status = 'coming_soon', sort_order = 2 where code = 'pharmacist';
update categories set status = 'hidden',      sort_order = 3 where code = 'physician';

-- The welcome screen reads names from this table now; it already showed
-- "ครูผู้สอน" for teachers (the seed said "ครู").
update categories set name_th = 'ครูผู้สอน' where code = 'teacher';
