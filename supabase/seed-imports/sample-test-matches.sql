-- Sample data to see match cards for a profile of:
--   ครูผู้สอน / คณิตศาสตร์ / สพป. / ต้นทางเชียงใหม่ -> ปลายทางกรุงเทพมหานคร
-- 3 claimed teachers who live in กรุงเทพมหานคร and want เชียงใหม่.
-- All rows use line_user_id 'test-sample-*' and display_name 'ทดสอบ …' so they
-- are easy to find and delete (cleanup at the bottom). Safe to re-run.

with new_teachers as (
  insert into teachers
    (line_user_id, display_name, position, service_type, origin_province, origin_district,
     origin_zone, current_school, teaching_group, subject, transfer_round, transfer_year,
     source, claimed_at, category)
  values
    ('test-sample-1', 'ทดสอบ หนึ่ง', 'teacher', 'primary', 'กรุงเทพมหานคร', 'เขตพญาไท',
     null, 'โรงเรียนตัวอย่าง 1', 'math', 'เอกคณิตศาสตร์', '1', 2027, 'app', now(), 'teacher'),
    ('test-sample-2', 'ทดสอบ สอง', 'teacher', 'primary', 'กรุงเทพมหานคร', 'เขตจตุจักร',
     null, 'โรงเรียนตัวอย่าง 2', 'math', null, '1', 2027, 'app', now(), 'teacher'),
    ('test-sample-3', 'ทดสอบ สาม', 'teacher', 'primary', 'กรุงเทพมหานคร', 'เขตบางกะปิ',
     null, 'โรงเรียนตัวอย่าง 3', 'math', 'เอกคณิตศาสตร์', '1', 2027, 'app', now(), 'teacher')
  on conflict (line_user_id) do update set claimed_at = excluded.claimed_at
  returning id
)
insert into destinations (teacher_id, province, district, zone)
select id, 'เชียงใหม่', null, null from new_teachers
on conflict (teacher_id, province) do nothing;

-- Cleanup when done:
-- delete from teachers where line_user_id like 'test-sample-%';  -- destinations cascade
