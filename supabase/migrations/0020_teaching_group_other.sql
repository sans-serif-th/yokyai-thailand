-- Adds อื่นๆ (Other) as a catch-all กลุ่มสาระการเรียนรู้, alongside the
-- matching addition to lib/teaching-groups.ts (the actual source the
-- real profile/criteria forms read from — this DB row is the
-- admin-reference copy, same dual-source pattern already documented on
-- that file and on the admin master-data teaching-groups tab).
insert into teaching_groups (code, name_th, name_en) values
  ('other', 'อื่นๆ', 'Other')
on conflict (code) do nothing;
