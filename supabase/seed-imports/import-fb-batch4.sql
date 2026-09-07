-- Seed import batch 4: 22 people parsed from the newest 15-link Facebook batch.
-- line_user_id uses 'seed:fb:<facebook id>' placeholders, never reachable by
-- a real LINE login. Each gets an invite_code so the real person can later
-- claim their record via /join/<code> (see lib/invites.ts).
-- To remove this batch: delete from teachers where line_user_id = any(array[
--   'seed:fb:100001364606291', 'seed:fb:937580278734366', 'seed:fb:100000750084306', 'seed:fb:100006569320777', 'seed:fb:100002264116655', 'seed:fb:100001561210600', 'seed:fb:100051185450758', 'seed:fb:100004224309228', 'seed:fb:4392639867664337', 'seed:fb:1684381939333029', 'seed:fb:100000702628326', 'seed:fb:1594679658735393', 'seed:fb:100050738314489', 'seed:fb:100002182512816', 'seed:fb:100001500249072', 'seed:fb:100001821884743', 'seed:fb:100030425361369', 'seed:fb:1475462013814397', 'seed:fb:100000622939109', 'seed:fb:27255022110814954', 'seed:fb:1489635525567001', 'seed:fb:1650712182669566']);

-- 1) ทัศน์วรรณ รุคเชด (เอกคณิตศาสตร์) — สพม.อุดรธานี
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100001364606291', 'ทัศน์วรรณ รุคเชด', 'teacher', 'secondary', 'อุดรธานี', 'math', 'เอกคณิตศาสตร์', 2027, 'https://www.facebook.com/100001364606291', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'อุดรธานี' from t;

-- 2) GoldJaguar5111 (เอกคณิตศาสตร์) — สพป.สุโขทัย เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:937580278734366', 'GoldJaguar5111', 'teacher', 'primary', 'สุโขทัย', 'เขต 1', 'math', 'เอกคณิตศาสตร์', 2027, 'https://www.facebook.com/937580278734366', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'พิจิตร', 'เขต 1' from t;

-- 3) Billa Yusoh (เอกคณิตศาสตร์) — สพป.นราธิวาส เขต 3
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100000750084306', 'Billa Yusoh', 'teacher', 'primary', 'นราธิวาส', 'เขต 3', 'math', 'เอกคณิตศาสตร์', 2027, 'https://www.facebook.com/100000750084306', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'นราธิวาส', 'เขต 2' from t;

-- 4) Thitipohn (เอกคณิตศาสตร์) — สพป.เลย เขต 3
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100006569320777', 'Thitipohn', 'teacher', 'primary', 'เลย', 'เขต 3', 'math', 'เอกคณิตศาสตร์', 2027, 'https://www.facebook.com/100006569320777', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'พิษณุโลก' from t;

-- 5) บี' อาร์ (เอกคณิตศาสตร์) — สพป.แม่ฮ่องสอน เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100002264116655', 'บี'' อาร์', 'teacher', 'primary', 'แม่ฮ่องสอน', 'เขต 1', 'math', 'เอกคณิตศาสตร์', 2027, 'https://www.facebook.com/100002264116655', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'เชียงใหม่' from t;

-- 6) Wilai Nuamklang (เอกคณิตศาสตร์) — สพม.สมุทรปราการ
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100001561210600', 'Wilai Nuamklang', 'teacher', 'secondary', 'สมุทรปราการ', 'math', 'เอกคณิตศาสตร์', 2027, 'https://www.facebook.com/100001561210600', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'กรุงเทพมหานคร', 'เขต 1' from t;

-- 7) Aoii Waran (เอกคณิตศาสตร์) — สพป.ระยอง เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100051185450758', 'Aoii Waran', 'teacher', 'primary', 'ระยอง', 'เขต 1', 'math', 'เอกคณิตศาสตร์', 2027, 'https://www.facebook.com/100051185450758', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ขอนแก่น', null from t
union all
select id, 'กาฬสินธุ์', null from t;

-- 8) Kjla Topfy (เอกคณิตศาสตร์) — สพป.ชัยภูมิ เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100004224309228', 'Kjla Topfy', 'teacher', 'primary', 'ชัยภูมิ', 'เขต 1', 'math', 'เอกคณิตศาสตร์', 2027, 'https://www.facebook.com/100004224309228', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ขอนแก่น', 'เขต 3' from t;

-- 9) KnowledgeableSeal3689 (เอกคอมพิวเตอร์) — สพป.ศรีสะเกษ เขต 3
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:4392639867664337', 'KnowledgeableSeal3689', 'teacher', 'primary', 'ศรีสะเกษ', 'เขต 3', 'occupation_tech', 'เอกคอมพิวเตอร์', 2027, 'https://www.facebook.com/4392639867664337', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'นครราชสีมา' from t;

-- 10) SparklyPapaya5793 (เอกคอมพิวเตอร์) — สพป.นครราชสีมา เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1684381939333029', 'SparklyPapaya5793', 'teacher', 'primary', 'นครราชสีมา', 'เขต 1', 'occupation_tech', 'เอกคอมพิวเตอร์', 2028, 'https://www.facebook.com/1684381939333029', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'นครราชสีมา', 'เขต 3' from t;

-- 11) Pornpawee Lowjow (เอกดนตรี) — สพป.สมุทรสาคร
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100000702628326', 'Pornpawee Lowjow', 'teacher', 'primary', 'สมุทรสาคร', 'art', 'เอกดนตรี', null, 'https://www.facebook.com/100000702628326', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'สมุทรสาคร' from t;

-- 12) GrayMoose7219 (เอกดนตรี/ดนตรีศึกษา) — สพม.นครพนม
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1594679658735393', 'GrayMoose7219', 'teacher', 'secondary', 'นครพนม', 'art', 'เอกดนตรี/ดนตรีศึกษา', null, 'https://www.facebook.com/1594679658735393', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'อุดรธานี', null from t
union all
select id, 'บึงกาฬ', null from t
union all
select id, 'สกลนคร', null from t;

-- 13) Mintra Puntumas (เอกดนตรีสากล) — สพม.ปทุมธานี
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100050738314489', 'Mintra Puntumas', 'teacher', 'secondary', 'ปทุมธานี', 'art', 'เอกดนตรีสากล', null, 'https://www.facebook.com/100050738314489', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'ชลบุรี' from t;

-- 14) Jirawaranit Sinla (เอกดนตรี) — สพม.กาญจนบุรี
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100002182512816', 'Jirawaranit Sinla', 'teacher', 'secondary', 'กาญจนบุรี', 'art', 'เอกดนตรี', null, 'https://www.facebook.com/100002182512816', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'อุทัยธานี', null from t
union all
select id, 'ชัยนาท', null from t;

-- 15) Anuchida Meunrit (เอกภาษาไทย) — สพป.ชัยภูมิ เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100001500249072', 'Anuchida Meunrit', 'teacher', 'primary', 'ชัยภูมิ', 'เขต 2', 'thai', 'เอกภาษาไทย', 2027, 'https://www.facebook.com/100001500249072', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ชัยภูมิ', 'เขต 2' from t
union all
select id, 'ขอนแก่น', 'เขต 5' from t;

-- 16) Tuly Statistics (คณิตศาสตร์) — สพป.บุรีรัมย์ เขต 3
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100001821884743', 'Tuly Statistics', 'teacher', 'primary', 'บุรีรัมย์', 'เขต 3', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100001821884743', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ร้อยเอ็ด', 'เขต 1' from t;

-- 17) Peter SU (เอกเคมี) — สพม.ยะลา
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100030425361369', 'Peter SU', 'teacher', 'secondary', 'ยะลา', 'science', 'เอกเคมี', null, 'https://www.facebook.com/100030425361369', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'ภูเก็ต' from t;

-- 18) UnforgettablePeapod2803 (เอกภาษาไทย) — สพป.ราชบุรี เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1475462013814397', 'UnforgettablePeapod2803', 'teacher', 'primary', 'ราชบุรี', 'เขต 2', 'thai', 'เอกภาษาไทย', null, 'https://www.facebook.com/1475462013814397', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ปทุมธานี', 'เขต 1' from t;

-- 19) Tonsom Samanya (เอกวิทย์) — สพป.สุรินทร์ เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100000622939109', 'Tonsom Samanya', 'teacher', 'primary', 'สุรินทร์', 'เขต 1', 'science', 'เอกวิทย์', null, 'https://www.facebook.com/100000622939109', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ปทุมธานี', 'เขต 1' from t;

-- 20) BraveAvocado7317 (เอกสังคมศึกษา) — สพป.ปทุมธานี เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:27255022110814954', 'BraveAvocado7317', 'teacher', 'primary', 'ปทุมธานี', 'เขต 2', 'social', 'เอกสังคมศึกษา', null, 'https://www.facebook.com/27255022110814954', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'สระบุรี', 'เขต 2' from t;

-- 21) PastelParsnip3492 (เอกไทย) — สพม.ปทุมธานี
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1489635525567001', 'PastelParsnip3492', 'teacher', 'secondary', 'ปทุมธานี', 'thai', 'เอกไทย', null, 'https://www.facebook.com/1489635525567001', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'นครราชสีมา', null from t
union all
select id, 'บุรีรัมย์', null from t;

-- 22) CopperSquirrel9308 (เอกอังกฤษ) — สพป.ปทุมธานี เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1650712182669566', 'CopperSquirrel9308', 'teacher', 'primary', 'ปทุมธานี', 'เขต 1', 'foreign_lang', 'เอกอังกฤษ', null, 'https://www.facebook.com/1650712182669566', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'นครศรีธรรมราช', null from t
union all
select id, 'ตรัง', null from t
union all
select id, 'พัทลุง', null from t
union all
select id, 'สงขลา', null from t;
