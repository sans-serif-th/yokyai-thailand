-- อ่านอย่างเดียว: ตรวจว่าโครงสร้างจริงของ DB ตรงกับแต่ละไฟล์ใน supabase/migrations/
-- ไหม โดยดูว่าตาราง/คอลัมน์/ดัชนีที่ migration นั้นสร้างมีอยู่จริง
-- วางทั้งไฟล์ใน Supabase SQL editor ของ DB ที่จะตรวจ แล้ว Run
--
-- ใช้ก่อน `scripts/supabase-mark-applied.sh` ทุกครั้ง: สคริปต์นั้นบันทึกว่า "รันแล้ว"
-- โดยไม่ตรวจอะไร ถ้ามีแถว ok = false แปลว่าไฟล์นั้นหลุด (ห้าม mark ข้ามมัน)
-- ok = null คือตรวจโครงสร้างไม่ได้ (เป็นข้อมูลล้วน หรือถูกไฟล์หลังลบทิ้ง)
--
-- เพิ่มแถวใหม่ทุกครั้งที่เขียน migration ใหม่ (เลขต่อจากแถวสุดท้าย)
with c as (
  select table_name || '.' || column_name as k, data_type, is_nullable
  from information_schema.columns where table_schema = 'public'
),
checks(migration, ok, note) as (values
  ('0002', to_regclass('public.service_types') is not null and exists(select 1 from c where k='teachers.origin_zone') and exists(select 1 from c where k='destinations.zone'), ''),
  ('0003', to_regclass('public.positions') is not null and exists(select 1 from c where k='teachers.position') and exists(select 1 from c where k='teachers.benefit_note'), ''),
  ('0004', exists(select 1 from c where k='teachers.transfer_round') and not exists(select 1 from c where k='teachers.service_start_date') and exists(select 1 from pg_constraint where conname='teachers_benefit_note_check'), ''),
  ('0005', to_regclass('public.favorites') is not null, ''),
  ('0006', exists(select 1 from c where k='teachers.facebook_url'), ''),
  ('0007', exists(select 1 from c where k='teachers.source'), ''),
  ('0008', to_regclass('public.rounds') is not null and to_regclass('public.round_subscriptions') is not null, ''),
  ('0009', exists(select 1 from c where k='teachers.invite_code'), ''),
  ('0010', exists(select 1 from c where k='teachers.transfer_round' and data_type='text'), ''),
  ('0011', exists(select 1 from c where k='teachers.transfer_year'), ''),
  ('0012', exists(select 1 from c where k='teachers.claimed_at'), ''),
  ('0013', to_regclass('public.categories') is not null and exists(select 1 from c where k='teachers.category'), ''),
  ('0014', to_regclass('public.subjects') is not null, ''),
  ('0015', exists(select 1 from c where k='teachers.admin_status'), ''),
  ('0016', null, 'ตรวจตรงไม่ได้: 0017 ลบคอลัมน์ที่ 0016 เพิ่ม'),
  ('0017', exists(select 1 from c where k='rounds.matching_opens_at') and not exists(select 1 from c where k='teachers.queue_released_at'), ''),
  ('0018', exists(select 1 from c where k='favorites.round_id'), ''),
  ('0019', exists(select 1 from categories where code='pharmacist'), ''),
  ('0020', exists(select 1 from teaching_groups where code='other'), ''),
  ('0021', exists(select 1 from c where k='teachers.phone'), ''),
  ('0022', null, 'เป็นข้อมูลเท่านั้น ตรวจตรงไม่ได้'),
  ('0023', to_regclass('public.contact_requests') is not null, ''),
  ('0024', exists(select 1 from c where k='teachers.line_id'), ''),
  ('0025', exists(select 1 from c where k='contact_requests.send_count'), ''),
  ('0026', to_regclass('public.news') is not null, ''),
  ('0027', to_regclass('public.admin_users') is not null, ''),
  ('0028', exists(select 1 from c where k='categories.status') and exists(select 1 from c where k='categories.sort_order'), ''),
  ('0029', exists(select 1 from c where k='news.publish_start') and exists(select 1 from c where k='news.publish_end'), ''),
  ('0030', exists(select 1 from pg_indexes where indexname='only_one_active_round_per_category') and exists(select 1 from c where k='rounds.category'), ''),
  ('0031', to_regclass('public.demo_profiles') is not null and exists(select 1 from c where k='teachers.position' and is_nullable='YES'), ''),
  ('0032', exists(select 1 from c where k='news.category'), ''),
  ('0033', not exists(select 1 from news where heading is not null and btrim(heading) <> ''), 'ไม่มีข่าวที่ heading ค้างอยู่'),
  ('0034', exists(select 1 from c where k='rounds.registration_opens_at') and exists(select 1 from c where k='rounds.registration_closes_at'), ''),
  ('0035', to_regclass('public.position_requests') is not null, ''),
  ('0036', exists(select 1 from pg_indexes where indexname='favorites_teacher_favorited_round_key') and not exists(select 1 from pg_constraint where conname='favorites_teacher_id_favorited_teacher_id_key'), ''),
  ('0037', not exists(select 1 from information_schema.role_table_grants where table_schema='public' and grantee in ('anon','authenticated')), 'anon/authenticated ไม่มีสิทธิ์บนตารางใน public'),
  -- ไม่ใช่ migration: ทุกตารางใน public ต้องเปิด RLS (note ขึ้นชื่อตารางที่ปิดอยู่)
  ('RLS', not exists(select 1 from pg_tables where schemaname='public' and not rowsecurity), coalesce((select string_agg(tablename, ', ') from pg_tables where schemaname='public' and not rowsecurity), ''))
)
select migration, ok, note from checks order by migration;
