-- ข้อมูลปลอมสำหรับโปรเจกต์ Supabase ทดสอบ (yokyai-test) เท่านั้น
-- ห้ามรันกับฐานข้อมูลจริง และห้ามนำข้อมูลครูจริงมาใส่ที่นี่
--
-- สิ่งที่ได้:
--   * รอบ "1/2570" ของครู เปิดจับคู่แล้ว (is_active = true)
--   * ครูปลอม 10 คน line_user_id ขึ้นต้น 'test-seed-' ชื่อขึ้นต้น 'ทดสอบ'
--
-- วิธีทดสอบ: ล็อกอินด้วยบัญชีของคุณเองบนแอปที่ชี้โปรเจกต์ทดสอบ แล้วลงทะเบียนเป็น
--   ครูผู้สอน / สพป. / กลุ่มสาระคณิตศาสตร์ / ต้นทาง เชียงใหม่ / ปลายทาง กรุงเทพมหานคร
-- จะเห็นผลจับคู่ 7 คน (คนที่ 8–10 ตั้งใจไม่ให้จับคู่ ใช้ตรวจว่ากฎจับคู่ทำงาน)
-- ถ้าผู้ทดสอบกรอกวิชาเอก 'เอกคณิตศาสตร์' คนที่ระบุเอกเหมือนกันจะได้ระดับสูงกว่า
-- รันซ้ำได้ (ใช้ on conflict)

insert into rounds (label, is_active, category, matching_opens_at)
values ('1/2570', true, 'teacher', now() - interval '1 day')
on conflict (category, label) do update
  set is_active = true, matching_opens_at = excluded.matching_opens_at;

with seed(n, name, service, origin, origin_district, zone, school, grp, subj, note, dest) as (
  values
    -- 1–7: อยู่กรุงเทพฯ อยากไปเชียงใหม่ -> จับคู่กับผู้ทดสอบ (เชียงใหม่ -> กรุงเทพฯ)
    (1,  'ทดสอบ หนึ่ง',   'primary',   'กรุงเทพมหานคร', 'เขตพญาไท',    'เขต 1', 'โรงเรียนตัวอย่าง 1', 'math',    'เอกคณิตศาสตร์', 'มีบ้านพักครู', 'เชียงใหม่'),
    (2,  'ทดสอบ สอง',     'primary',   'กรุงเทพมหานคร', 'เขตจตุจักร',   'เขต 2', 'โรงเรียนตัวอย่าง 2', 'math',    null,            null,           'เชียงใหม่'),
    (3,  'ทดสอบ สาม',     'primary',   'กรุงเทพมหานคร', 'เขตบางกะปิ',   'เขต 1', 'โรงเรียนตัวอย่าง 3', 'math',    'เอกคณิตศาสตร์', null,           'เชียงใหม่'),
    (4,  'ทดสอบ สี่',     'primary',   'กรุงเทพมหานคร', 'เขตดุสิต',     'เขต 1', 'โรงเรียนตัวอย่าง 4', 'math',    null,            null,           'เชียงใหม่'),
    (5,  'ทดสอบ ห้า',     'primary',   'กรุงเทพมหานคร', 'เขตบางรัก',    'เขต 2', 'โรงเรียนตัวอย่าง 5', 'math',    'เอกคณิตศาสตร์', 'ใกล้ BTS',     'เชียงใหม่'),
    (6,  'ทดสอบ หก',      'primary',   'กรุงเทพมหานคร', 'เขตลาดพร้าว',  'เขต 1', 'โรงเรียนตัวอย่าง 6', 'math',    null,            null,           'เชียงใหม่'),
    (7,  'ทดสอบ เจ็ด',    'primary',   'กรุงเทพมหานคร', 'เขตบางนา',     'เขต 2', 'โรงเรียนตัวอย่าง 7', 'math',    'เอกคณิตศาสตร์', null,           'เชียงใหม่'),
    -- 8–10: ตั้งใจไม่จับคู่ (8 ปลายทางคนละจังหวัด / 9 คนละประเภทหน่วยงาน สพม. / 10 คนละกลุ่มสาระ)
    (8,  'ทดสอบ แปด',     'primary',   'กรุงเทพมหานคร', 'เขตสาทร',      'เขต 1', 'โรงเรียนตัวอย่าง 8', 'math',    null,            null,           'ภูเก็ต'),
    (9,  'ทดสอบ เก้า',    'secondary', 'กรุงเทพมหานคร', 'เขตบางซื่อ',   'เขต 1', 'โรงเรียนตัวอย่าง 9', 'math',    null,            null,           'เชียงใหม่'),
    (10, 'ทดสอบ สิบ',     'primary',   'กรุงเทพมหานคร', 'เขตมีนบุรี',   'เขต 2', 'โรงเรียนตัวอย่าง 10', 'science', null,           null,           'เชียงใหม่')
),
new_teachers as (
  insert into teachers
    (line_user_id, display_name, position, service_type, origin_province, origin_district,
     origin_zone, current_school, teaching_group, subject, benefit_note, line_id,
     transfer_round, transfer_year, source, claimed_at, category)
  select
    'test-seed-' || n, name, 'teacher', service, origin, origin_district,
    zone, school, grp, subj, note, 'test.line.' || n,
    '1', 2027, 'app', now(), 'teacher'
  from seed
  on conflict (line_user_id) do update set claimed_at = excluded.claimed_at
  returning id, line_user_id
)
insert into destinations (teacher_id, province, district, zone)
select t.id, s.dest, null, null
from new_teachers t
join seed s on t.line_user_id = 'test-seed-' || s.n
on conflict (teacher_id, province) do nothing;

-- ล้างข้อมูลปลอมเมื่อใช้เสร็จ (destinations ถูกลบตามอัตโนมัติ):
-- delete from teachers where line_user_id like 'test-seed-%';
