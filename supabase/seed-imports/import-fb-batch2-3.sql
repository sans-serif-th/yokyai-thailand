-- Seed import batch 2+3: 63 people parsed from 15 Facebook group posts.
-- line_user_id uses 'seed:fb:<facebook id>' placeholders, never reachable by
-- a real LINE login. Each gets an invite_code so the real person can later
-- claim their record via /join/<code> (see lib/invites.ts).
-- To remove this batch: delete from teachers where line_user_id like 'seed:fb:%';

-- 1) English_5212 (เอกภาษาอังกฤษ) — สพป.สุพรรณบุรี เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:2116478152592240', 'English_5212', 'teacher', 'primary', 'สุพรรณบุรี', 'เขต 1', 'foreign_lang', 'เอกภาษาอังกฤษ', null, 'https://www.facebook.com/2116478152592240', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'สุพรรณบุรี', 'เขต 2' from t;

-- 2) AttractiveChipmunk88888 (เอกภาษาอังกฤษ) — สพป.เพชรบูรณ์ เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:957239504002183', 'AttractiveChipmunk88888', 'teacher', 'primary', 'เพชรบูรณ์', 'เขต 2', 'foreign_lang', 'เอกภาษาอังกฤษ', null, 'https://www.facebook.com/957239504002183', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'เพชรบูรณ์', 'เขต 3' from t
union all
select id, 'นนทบุรี', null from t
union all
select id, 'ปทุมธานี', null from t
union all
select id, 'กรุงเทพมหานคร', null from t
union all
select id, 'พระนครศรีอยุธยา', null from t
union all
select id, 'ลพบุรี', null from t
union all
select id, 'สระบุรี', null from t;

-- 3) ครูผู้น้อยคอยรัก (เอกภาษาอังกฤษ) — สพม.สระแก้ว
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1564743742061192', 'ครูผู้น้อยคอยรัก', 'teacher', 'secondary', 'สระแก้ว', 'foreign_lang', 'เอกภาษาอังกฤษ', null, 'https://www.facebook.com/1564743742061192', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'สุรินทร์' from t;

-- 4) Beeee7980 (เอกภาษาอังกฤษ) — สพม.ประจวบคีรีขันธ์
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1344871330361414', 'Beeee7980', 'teacher', 'secondary', 'ประจวบคีรีขันธ์', 'foreign_lang', 'เอกภาษาอังกฤษ', null, 'https://www.facebook.com/1344871330361414', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'สุราษฎร์ธานี', null from t
union all
select id, 'ชุมพร', null from t;

-- 5) SincereCranberry5065 (เอกภาษาอังกฤษ) — สพป.อุบลราชธานี เขต 5
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1338426787823871', 'SincereCranberry5065', 'teacher', 'primary', 'อุบลราชธานี', 'เขต 5', 'foreign_lang', 'เอกภาษาอังกฤษ', null, 'https://www.facebook.com/1338426787823871', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'อุบลราชธานี', 'เขต 1' from t
union all
select id, 'ศรีสะเกษ', null from t;

-- 6) KeenPanda4039 (เอกภาษาอังกฤษ) — สพป.ชลบุรี เขต 3
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1047316021533049', 'KeenPanda4039', 'teacher', 'primary', 'ชลบุรี', 'เขต 3', 'foreign_lang', 'เอกภาษาอังกฤษ', 2027, 'https://www.facebook.com/1047316021533049', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'นครพนม', null from t
union all
select id, 'สกลนคร', 'เขต 1' from t
union all
select id, 'ตราด', null from t
union all
select id, 'จันทบุรี', null from t;

-- 7) BeautifulNarwhal8137 (เอกภาษาอังกฤษ) — สพป.จันทบุรี เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1047146631333162', 'BeautifulNarwhal8137', 'teacher', 'primary', 'จันทบุรี', 'เขต 2', 'foreign_lang', 'เอกภาษาอังกฤษ', null, 'https://www.facebook.com/1047146631333162', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'สระแก้ว' from t;

-- 8) BronzeBlueberry9605 (เอกภาษาอังกฤษ) — สพม.นครศรีธรรมราช
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1567331115045810', 'BronzeBlueberry9605', 'teacher', 'secondary', 'นครศรีธรรมราช', 'foreign_lang', 'เอกภาษาอังกฤษ', null, 'https://www.facebook.com/1567331115045810', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'กรุงเทพมหานคร', 'เขต 1' from t;

-- 9) OrangeAsparagus4503 (เอกภาษาอังกฤษ) — สพม.กรุงเทพมหานคร เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1839164664075123', 'OrangeAsparagus4503', 'teacher', 'secondary', 'กรุงเทพมหานคร', 'เขต 2', 'foreign_lang', 'เอกภาษาอังกฤษ', null, 'https://www.facebook.com/1839164664075123', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'พิษณุโลก', null from t
union all
select id, 'อุตรดิตถ์', null from t;

-- 10) Yyyyyy12 (ศิลปะ) — สพป.สุราษฎร์ธานี เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1319457389514993', 'Yyyyyy12', 'teacher', 'primary', 'สุราษฎร์ธานี', 'เขต 2', 'art', 'ศิลปะ', 2026, 'https://www.facebook.com/1319457389514993', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'นครศรีธรรมราช' from t;

-- 11) Kru Ben Janpen (เอกดนตรีไทย) — สพป.ชลบุรี เขต 3
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100069362275098', 'Kru Ben Janpen', 'teacher', 'primary', 'ชลบุรี', 'เขต 3', 'art', 'เอกดนตรีไทย', 2026, 'https://www.facebook.com/100069362275098', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ราชบุรี', 'เขต 2' from t;

-- 12) CaptivatingPineapple6346 (นาฏศิลป์) — สพม.สมุทรปราการ
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:2201112447307796', 'CaptivatingPineapple6346', 'teacher', 'secondary', 'สมุทรปราการ', 'art', 'นาฏศิลป์', 2026, 'https://www.facebook.com/2201112447307796', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'กรุงเทพมหานคร' from t;

-- 13) AdventurousParsnip4148 (ดนตรีศึกษา) — สพม.สุรินทร์
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1861460417851097', 'AdventurousParsnip4148', 'teacher', 'secondary', 'สุรินทร์', 'art', 'ดนตรีศึกษา', 2026, 'https://www.facebook.com/1861460417851097', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'ขอนแก่น' from t;

-- 14) Sivimon Thepraksa (ทัศนศิลป์) — สพม.แม่ฮ่องสอน
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100018243910278', 'Sivimon Thepraksa', 'teacher', 'secondary', 'แม่ฮ่องสอน', 'art', 'ทัศนศิลป์', 2026, 'https://www.facebook.com/100018243910278', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'เชียงใหม่', null from t
union all
select id, 'พะเยา', null from t
union all
select id, 'เชียงราย', null from t;

-- 15) HandsomeMouse2812 (เอกดนตรี) — สพป.สกลนคร เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1539465044353649', 'HandsomeMouse2812', 'teacher', 'primary', 'สกลนคร', 'เขต 2', 'art', 'เอกดนตรี', 2026, 'https://www.facebook.com/1539465044353649', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'อุดรธานี', 'เขต 1' from t;

-- 16) Intelligent4909 (สังคมศึกษา) — สพป.กาฬสินธุ์ เขต 3
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1337444414826245', 'Intelligent4909', 'teacher', 'primary', 'กาฬสินธุ์', 'เขต 3', 'social', 'สังคมศึกษา', null, 'https://www.facebook.com/1337444414826245', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'ขอนแก่น' from t;

-- 17) Puipuy Janjira (สังคมศึกษา) — สพป.ขอนแก่น เขต 4
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100002356390893', 'Puipuy Janjira', 'teacher', 'primary', 'ขอนแก่น', 'เขต 4', 'social', 'สังคมศึกษา', null, 'https://www.facebook.com/100002356390893', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'หนองคาย', 'เขต 1' from t;

-- 18) Tuinui Mayuree (สังคมศึกษา) — สพป.นครราชสีมา เขต 7
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100000737876576', 'Tuinui Mayuree', 'teacher', 'primary', 'นครราชสีมา', 'เขต 7', 'social', 'สังคมศึกษา', null, 'https://www.facebook.com/100000737876576', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'บุรีรัมย์', 'เขต 3' from t
union all
select id, 'นครราชสีมา', 'เขต 2' from t;

-- 19) Suwachira Suwanwiang (สังคมศึกษา) — สพป.นครพนม เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100006527626185', 'Suwachira Suwanwiang', 'teacher', 'primary', 'นครพนม', 'เขต 2', 'social', 'สังคมศึกษา', null, 'https://www.facebook.com/100006527626185', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'ร้อยเอ็ด' from t;

-- 20) YellowFlower1790 (สังคมศึกษา) — สพป.อุบลราชธานี เขต 3
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1219759713641120', 'YellowFlower1790', 'teacher', 'primary', 'อุบลราชธานี', 'เขต 3', 'social', 'สังคมศึกษา', null, 'https://www.facebook.com/1219759713641120', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'สุรินทร์', 'เขต 3' from t
union all
select id, 'ศรีสะเกษ', null from t;

-- 21) Genz_art5578 (สังคมศึกษา) — สพป.หนองคาย เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1047628557981411', 'Genz_art5578', 'teacher', 'primary', 'หนองคาย', 'เขต 1', 'social', 'สังคมศึกษา', null, 'https://www.facebook.com/1047628557981411', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'หนองบัวลำภู', 'เขต 1' from t;

-- 22) Nipon Duangmeun (สังคมศึกษา) — สพม.ชุมพร
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100007209040659', 'Nipon Duangmeun', 'teacher', 'secondary', 'ชุมพร', 'social', 'สังคมศึกษา', null, 'https://www.facebook.com/100007209040659', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'สงขลา', null from t
union all
select id, 'สตูล', null from t;

-- 23) เอ๋ สิทธิพงษ์ (สังคมศึกษา) — สพป.ชลบุรี เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100002452284112', 'เอ๋ สิทธิพงษ์', 'teacher', 'primary', 'ชลบุรี', 'เขต 2', 'social', 'สังคมศึกษา', null, 'https://www.facebook.com/100002452284112', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'สกลนคร' from t;

-- 24) Jutamat Hiamharn (สังคมศึกษา) — สพป.ราชบุรี เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100015108738900', 'Jutamat Hiamharn', 'teacher', 'primary', 'ราชบุรี', 'เขต 2', 'social', 'สังคมศึกษา', null, 'https://www.facebook.com/100015108738900', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'เพชรบุรี' from t;

-- 25) Sukanya Pilachai (สังคมศึกษา) — สพป.อำนาจเจริญ
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100014421195896', 'Sukanya Pilachai', 'teacher', 'primary', 'อำนาจเจริญ', 'social', 'สังคมศึกษา', 2027, 'https://www.facebook.com/100014421195896', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'บุรีรัมย์' from t;

-- 26) Fareedah Dusa (ภาษาไทย) — สพป.สงขลา เขต 3
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100001165762423', 'Fareedah Dusa', 'teacher', 'primary', 'สงขลา', 'เขต 3', 'thai', 'ภาษาไทย', null, 'https://www.facebook.com/100001165762423', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'สงขลา', 'เขต 3' from t;

-- 27) DaDa701 (ภาษาไทย) — สพป.อุบลราชธานี เขต 5
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1562815152101346', 'DaDa701', 'teacher', 'primary', 'อุบลราชธานี', 'เขต 5', 'thai', 'ภาษาไทย', null, 'https://www.facebook.com/1562815152101346', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'สุรินทร์' from t;

-- 28) Wanwali4894 (ภาษาไทย) — สพม.กรุงเทพมหานคร เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:3924525274517209', 'Wanwali4894', 'teacher', 'secondary', 'กรุงเทพมหานคร', 'เขต 2', 'thai', 'ภาษาไทย', null, 'https://www.facebook.com/3924525274517209', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'นครพนม' from t;

-- 29) จิรดา จำเริญเจือ (ภาษาไทย) — สพป.กาฬสินธุ์ เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100014500123307', 'จิรดา จำเริญเจือ', 'teacher', 'primary', 'กาฬสินธุ์', 'เขต 1', 'thai', 'ภาษาไทย', null, 'https://www.facebook.com/100014500123307', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'กาฬสินธุ์', 'เขต 3' from t
union all
select id, 'สกลนคร', 'เขต 1' from t;

-- 30) Koon Chanyanuch (ภาษาไทย) — สพม.ราชบุรี
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100003969840296', 'Koon Chanyanuch', 'teacher', 'secondary', 'ราชบุรี', 'thai', 'ภาษาไทย', null, 'https://www.facebook.com/100003969840296', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'ราชบุรี' from t;

-- 31) TurquoiseStrawberry6061 (ภาษาไทย) — สพป.สระแก้ว เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:2440335009802149', 'TurquoiseStrawberry6061', 'teacher', 'primary', 'สระแก้ว', 'เขต 1', 'thai', 'ภาษาไทย', null, 'https://www.facebook.com/2440335009802149', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ชลบุรี', 'เขต 3' from t;

-- 32) Fammiiz Pitcha (ภาษาไทย) — สพป.เชียงราย เขต 3
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100000122339047', 'Fammiiz Pitcha', 'teacher', 'primary', 'เชียงราย', 'เขต 3', 'thai', 'ภาษาไทย', null, 'https://www.facebook.com/100000122339047', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'เชียงราย' from t;

-- 33) Kannika Phunchuay (ภาษาไทย) — สพม.สมุทรปราการ
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100001656670584', 'Kannika Phunchuay', 'teacher', 'secondary', 'สมุทรปราการ', 'thai', 'ภาษาไทย', null, 'https://www.facebook.com/100001656670584', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'นครศรีธรรมราช', null from t
union all
select id, 'สุราษฎร์ธานี', null from t
union all
select id, 'ชุมพร', null from t;

-- 34) Kittima Kaewjamnong (ภาษาไทย) — สพป.สมุทรปราการ
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100004740272238', 'Kittima Kaewjamnong', 'teacher', 'primary', 'สมุทรปราการ', 'thai', 'ภาษาไทย', null, 'https://www.facebook.com/100004740272238', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'นครศรีธรรมราช' from t;

-- 35) Warinya Mangkala (ภาษาไทย) — สพม.ภูเก็ต
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100036974296634', 'Warinya Mangkala', 'teacher', 'secondary', 'ภูเก็ต', 'thai', 'ภาษาไทย', null, 'https://www.facebook.com/100036974296634', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'สุราษฎร์ธานี' from t;

-- 36) Eaknaree Wannasu (ภาษาไทย) — สพม.หนองคาย
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100010452406024', 'Eaknaree Wannasu', 'teacher', 'secondary', 'หนองคาย', 'thai', 'ภาษาไทย', null, 'https://www.facebook.com/100010452406024', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'สกลนคร' from t;

-- 37) Onkya Kch (ภาษาไทย) — สพป.สมุทรปราการ เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1363219367', 'Onkya Kch', 'teacher', 'primary', 'สมุทรปราการ', 'เขต 1', 'thai', 'ภาษาไทย', null, 'https://www.facebook.com/1363219367', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'กรุงเทพมหานคร' from t;

-- 38) NiceShark88 (ภาษาไทย) — สพม.สมุทรปราการ
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1080793027763874', 'NiceShark88', 'teacher', 'secondary', 'สมุทรปราการ', 'thai', 'ภาษาไทย', null, 'https://www.facebook.com/1080793027763874', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'อุบลราชธานี' from t;

-- 39) ประภาพร ประภาพร (เอกวิทยาศาสตร์ ทั่วไป) — สพป.นครราชสีมา เขต 5
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100002505016586', 'ประภาพร ประภาพร', 'teacher', 'primary', 'นครราชสีมา', 'เขต 5', 'science', 'เอกวิทยาศาสตร์ ทั่วไป', 2027, 'https://www.facebook.com/100002505016586', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ชัยภูมิ', 'เขต 1' from t;

-- 40) Pakjira Fahh (เอกวิทยาศาสตร์) — สพป.พังงา
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100002849484241', 'Pakjira Fahh', 'teacher', 'primary', 'พังงา', 'science', 'เอกวิทยาศาสตร์', 2027, 'https://www.facebook.com/100002849484241', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ตรัง', null from t
union all
select id, 'กระบี่', null from t;

-- 41) Motana Rattanawaraha (เอกวิทย์ทั่วไป) — สพม.พิจิตร
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100001138353996', 'Motana Rattanawaraha', 'teacher', 'secondary', 'พิจิตร', 'science', 'เอกวิทย์ทั่วไป', 2027, 'https://www.facebook.com/100001138353996', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'นครสวรรค์' from t;

-- 42) Phanphiboon N. Eur (เอกวิทยาศาสตร์ทั่วไป) — สพป.ชลบุรี เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100003522696156', 'Phanphiboon N. Eur', 'teacher', 'primary', 'ชลบุรี', 'เขต 1', 'science', 'เอกวิทยาศาสตร์ทั่วไป', 2027, 'https://www.facebook.com/100003522696156', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ร้อยเอ็ด', null from t
union all
select id, 'มหาสารคาม', null from t;

-- 43) JazzyFrog9816 (เอกวิทย์) — สพป.บุรีรัมย์ เขต 4
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1041980865280875', 'JazzyFrog9816', 'teacher', 'primary', 'บุรีรัมย์', 'เขต 4', 'science', 'เอกวิทย์', 2027, 'https://www.facebook.com/1041980865280875', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ศรีสะเกษ', 'เขต 3' from t;

-- 44) Maytinee Somjit (วิชาเอกภาษาไทย) — สพป.สมุทรปราการ เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100001191512709', 'Maytinee Somjit', 'teacher', 'primary', 'สมุทรปราการ', 'เขต 2', 'thai', 'วิชาเอกภาษาไทย', 2027, 'https://www.facebook.com/100001191512709', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'สงขลา', 'เขต 1' from t;

-- 45) Namtan Siriporn (วิชาเอกสังคมศึกษา) — สพป.สระแก้ว เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100001786146105', 'Namtan Siriporn', 'teacher', 'primary', 'สระแก้ว', 'เขต 1', 'social', 'วิชาเอกสังคมศึกษา', 2027, 'https://www.facebook.com/100001786146105', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ศรีสะเกษ', 'เขต 1' from t;

-- 46) PurplePanda9632 (เอกคณิตศาสตร์) — สพป.นครราชสีมา เขต 7
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1658997925684921', 'PurplePanda9632', 'teacher', 'primary', 'นครราชสีมา', 'เขต 7', 'math', 'เอกคณิตศาสตร์', 2027, 'https://www.facebook.com/1658997925684921', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'กาฬสินธุ์', 'เขต 2' from t;

-- 47) PassionateDeer4221 (วิชาเอกประถม) — สพป.ปทุมธานี เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:2179757369273615', 'PassionateDeer4221', 'teacher', 'primary', 'ปทุมธานี', 'เขต 1', null, 'วิชาเอกประถม', 2027, 'https://www.facebook.com/2179757369273615', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'สงขลา', 'เขต 3' from t;

-- 48) SwiftArugula9455 (วิชาเอกชีววิทยา) — สพม.อำนาจเจริญ
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:2520520221755378', 'SwiftArugula9455', 'teacher', 'secondary', 'อำนาจเจริญ', 'science', 'วิชาเอกชีววิทยา', 2027, 'https://www.facebook.com/2520520221755378', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'นครพนม' from t;

-- 49) LivelyPomelo41 (เอกภาษาไทย) — สพป.สตูล
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:2036427607004377', 'LivelyPomelo41', 'teacher', 'primary', 'สตูล', 'thai', 'เอกภาษาไทย', 2027, 'https://www.facebook.com/2036427607004377', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'สมุทรปราการ', null from t
union all
select id, 'กรุงเทพมหานคร', null from t
union all
select id, 'นนทบุรี', null from t;

-- 50) ShinyPeacock5960 (เอกคณิตศาสตร์) — สพป.หนองคาย เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1035328842833327', 'ShinyPeacock5960', 'teacher', 'primary', 'หนองคาย', 'เขต 2', 'math', 'เอกคณิตศาสตร์', 2027, 'https://www.facebook.com/1035328842833327', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'บึงกาฬ' from t;

-- 51) BrilliantLynx8550 (เอกวิทยาศาสตร์/ชีววิทยา) — สพม.สมุทรสงคราม
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1595357785704288', 'BrilliantLynx8550', 'teacher', 'secondary', 'สมุทรสงคราม', 'science', 'เอกวิทยาศาสตร์/ชีววิทยา', 2027, 'https://www.facebook.com/1595357785704288', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'นครปฐม', null from t
union all
select id, 'กาญจนบุรี', null from t
union all
select id, 'ราชบุรี', null from t;

-- 52) WhiteOstrich4262 (วิชาเอกคหกรรม) — สพม.นครพนม
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:912920461475347', 'WhiteOstrich4262', 'teacher', 'secondary', 'นครพนม', 'occupation_tech', 'วิชาเอกคหกรรม', 2027, 'https://www.facebook.com/912920461475347', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'สกลนคร', null from t
union all
select id, 'บึงกาฬ', null from t;

-- 53) Petchdarat Thongthai (เอกคณิตศาสตร์) — สพป.กำแพงเพชร เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1827555470', 'Petchdarat Thongthai', 'teacher', 'primary', 'กำแพงเพชร', 'เขต 2', 'math', 'เอกคณิตศาสตร์', null, 'https://www.facebook.com/1827555470', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'พระนครศรีอยุธยา', null from t
union all
select id, 'อ่างทอง', null from t;

-- 54) Mangkartoon (เอกคณิตศาสตร์) — สพป.พิษณุโลก เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100002594888073', 'Mangkartoon', 'teacher', 'primary', 'พิษณุโลก', 'เขต 2', 'math', 'เอกคณิตศาสตร์', null, 'https://www.facebook.com/100002594888073', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'อุตรดิตถ์', null from t
union all
select id, 'แพร่', null from t;

-- 55) Muk Rakchanok (เอกคณิตศาสตร์) — สพป.สุราษฎร์ธานี เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100002975919708', 'Muk Rakchanok', 'teacher', 'primary', 'สุราษฎร์ธานี', 'เขต 2', 'math', 'เอกคณิตศาสตร์', null, 'https://www.facebook.com/100002975919708', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'นครศรีธรรมราช' from t;

-- 56) Thidarat Rattananon (เอกคณิตศาสตร์) — สพป.พิษณุโลก เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100002039587484', 'Thidarat Rattananon', 'teacher', 'primary', 'พิษณุโลก', 'เขต 1', 'math', 'เอกคณิตศาสตร์', null, 'https://www.facebook.com/100002039587484', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'เชียงใหม่', 'เขต 1' from t;

-- 57) Wittaya Kanpromkad (เอกคณิตศาสตร์) — สพป.ลำพูน เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100001268893623', 'Wittaya Kanpromkad', 'teacher', 'primary', 'ลำพูน', 'เขต 2', 'math', 'เอกคณิตศาสตร์', null, 'https://www.facebook.com/100001268893623', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ลำพูน', 'เขต 1' from t;

-- 58) LoveSmartSmile (เอกคณิตศาสตร์) — สพป.เชียงใหม่ เขต 4
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1377752200773771', 'LoveSmartSmile', 'teacher', 'primary', 'เชียงใหม่', 'เขต 4', 'math', 'เอกคณิตศาสตร์', null, 'https://www.facebook.com/1377752200773771', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ลำปาง', 'เขต 3' from t;

-- 59) So Soparat (เอกคณิตศาสตร์) — สพป.สุราษฎร์ธานี เขต 3
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100001681197208', 'So Soparat', 'teacher', 'primary', 'สุราษฎร์ธานี', 'เขต 3', 'math', 'เอกคณิตศาสตร์', null, 'https://www.facebook.com/100001681197208', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'นครศรีธรรมราช' from t;

-- 60) Tpatima Tamsee (เอกภาษาอังกฤษ) — สพม.ชลบุรี
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100000106677387', 'Tpatima Tamsee', 'teacher', 'secondary', 'ชลบุรี', 'foreign_lang', 'เอกภาษาอังกฤษ', 2027, 'https://www.facebook.com/100000106677387', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'นครราชสีมา', null from t
union all
select id, 'ขอนแก่น', null from t;

-- 61) Waraphörn Dondee (เอกอังกฤษ) — สพป.พิษณุโลก เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100012558674741', 'Waraphörn Dondee', 'teacher', 'primary', 'พิษณุโลก', 'เขต 2', 'foreign_lang', 'เอกอังกฤษ', null, 'https://www.facebook.com/100012558674741', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'พิษณุโลก', null from t
union all
select id, 'สุโขทัย', null from t;

-- 62) Panarat Ch (เอกอังกฤษ) — สพป.สุโขทัย เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100079615417803', 'Panarat Ch', 'teacher', 'primary', 'สุโขทัย', 'เขต 1', 'foreign_lang', 'เอกอังกฤษ', null, 'https://www.facebook.com/100079615417803', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'พิษณุโลก' from t;

-- 63) KruPaul Tassana (เอกอังกฤษ) — สพป.ราชบุรี เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100000867519957', 'KruPaul Tassana', 'teacher', 'primary', 'ราชบุรี', 'เขต 1', 'foreign_lang', 'เอกอังกฤษ', null, 'https://www.facebook.com/100000867519957', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'เพชรบุรี' from t;
