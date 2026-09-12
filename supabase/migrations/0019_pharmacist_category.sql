-- Adds เภสัชกร (pharmacist) as a 4th row in categories, alongside the
-- welcome-screen redesign (see lib/categories.ts) which shows it as a
-- disabled "เร็วๆนี้" option next to ครูผู้สอน/พยาบาล. Not yet selectable
-- or written anywhere in application code — this only keeps the DB table
-- documented/consistent, same reference-only role it already plays for
-- teacher/nurse/physician (teachers.category still defaults to 'teacher').
insert into categories (code, name_th, name_en) values
  ('pharmacist', 'เภสัชกร', 'Pharmacist')
on conflict (code) do nothing;
