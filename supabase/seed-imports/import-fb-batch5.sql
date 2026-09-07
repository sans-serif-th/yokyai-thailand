-- Seed import batch 5: 47 people mined from the expanded ปทุมธานี megathread
-- (Hatairat Radchasena's post, permalink 25519061234458565) that the user pasted
-- in full after manually expanding all comments/replies in their own browser.
-- The 10 top-level comments already imported in batch 4 are NOT repeated here.
-- line_user_id uses 'seed:fb:<facebook id>' placeholders, never reachable by
-- a real LINE login. Each gets an invite_code so the real person can later
-- claim their record via /join/<code> (see lib/invites.ts).
-- To remove this batch: delete from teachers where line_user_id = any(array[
--   'seed:fb:100002597650973', 'seed:fb:100001510396554', 'seed:fb:100003688390648', 'seed:fb:100001163980766', 'seed:fb:100007621650886', 'seed:fb:100006779254186', 'seed:fb:100011340540603', 'seed:fb:1313339397010638', 'seed:fb:100002556668614', 'seed:fb:100008412332006', 'seed:fb:1937547036948617', 'seed:fb:100004966963454', 'seed:fb:1029315883098020', 'seed:fb:100001601313217', 'seed:fb:100001898983265', 'seed:fb:100002555709806', 'seed:fb:1516996426559274', 'seed:fb:854514091044471', 'seed:fb:100040569456081', 'seed:fb:100039551137256', 'seed:fb:100004995696259', 'seed:fb:974353621872195', 'seed:fb:100007912308225', 'seed:fb:100014445184103', 'seed:fb:100001277359648', 'seed:fb:100003890747135', 'seed:fb:100024764070173', 'seed:fb:100000099917050', 'seed:fb:100006465624537', 'seed:fb:100000074941183', 'seed:fb:100002423874792', 'seed:fb:61575483950927', 'seed:fb:100001493568185', 'seed:fb:100070390312655', 'seed:fb:100001445329513', 'seed:fb:1443992194', 'seed:fb:2309178516577361', 'seed:fb:1357884996220451', 'seed:fb:100001100168488', 'seed:fb:997281623100384', 'seed:fb:100002831841596', 'seed:fb:1035568955822128', 'seed:fb:100000844803884', 'seed:fb:1533806928441295', 'seed:fb:100000091412921', 'seed:fb:1132405582451084', 'seed:fb:61556463165019']);

-- 1) Aon Wasan (คอมพิวเตอร์) — สพป.ปทุมธานี เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100002597650973', 'Aon Wasan', 'teacher', 'primary', 'ปทุมธานี', 'เขต 1', 'occupation_tech', 'คอมพิวเตอร์', null, 'https://www.facebook.com/100002597650973', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'สุรินทร์', 'เขต 1' from t;

-- 2) FaNg IntuOn (ชีววิทยา) — สพม.กาญจนบุรี
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100001510396554', 'FaNg IntuOn', 'teacher', 'secondary', 'กาญจนบุรี', 'science', 'ชีววิทยา', null, 'https://www.facebook.com/100001510396554', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'กรุงเทพมหานคร', null from t
union all
select id, 'นนทบุรี', null from t
union all
select id, 'ปทุมธานี', null from t
union all
select id, 'นครปฐม', null from t
union all
select id, 'สมุทรสาคร', null from t
union all
select id, 'สมุทรปราการ', null from t
union all
select id, 'ราชบุรี', null from t
union all
select id, 'พระนครศรีอยุธยา', null from t;

-- 3) Piw Lalida (ภาษาอังกฤษ) — สพป.ปทุมธานี เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100003688390648', 'Piw Lalida', 'teacher', 'primary', 'ปทุมธานี', 'เขต 2', 'foreign_lang', 'ภาษาอังกฤษ', null, 'https://www.facebook.com/100003688390648', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ปทุมธานี', 'เขต 1' from t;

-- 4) Preyanud Muacksang (วิทยาศาสตร์) — สพป.ปทุมธานี เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100001163980766', 'Preyanud Muacksang', 'teacher', 'primary', 'ปทุมธานี', 'เขต 2', 'science', 'วิทยาศาสตร์', null, 'https://www.facebook.com/100001163980766', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ปทุมธานี', 'เขต 1' from t;

-- 5) Grace Napassorn Oaksornsom (วิทยาศาสตร์) — สพป.พังงา
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100007621650886', 'Grace Napassorn Oaksornsom', 'teacher', 'primary', 'พังงา', 'science', 'วิทยาศาสตร์', null, 'https://www.facebook.com/100007621650886', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'ปทุมธานี' from t;

-- 6) โบอา (สังคม) — สพป.สิงห์บุรี
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100006779254186', 'โบอา', 'teacher', 'primary', 'สิงห์บุรี', 'social', 'สังคม', null, 'https://www.facebook.com/100006779254186', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ปทุมธานี', 'เขต 1' from t;

-- 7) Chanakan Mueanprom (เอกสังคม) — สพม.ปทุมธานี
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100011340540603', 'Chanakan Mueanprom', 'teacher', 'secondary', 'ปทุมธานี', 'social', 'เอกสังคม', null, 'https://www.facebook.com/100011340540603', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'บุรีรัมย์' from t;

-- 8) MagicalDeer7169 (คอมพิวเตอร์) — สพป.อ่างทอง
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1313339397010638', 'MagicalDeer7169', 'teacher', 'primary', 'อ่างทอง', 'occupation_tech', 'คอมพิวเตอร์', null, 'https://www.facebook.com/1313339397010638', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'ปทุมธานี' from t;

-- 9) Miaw Sisai (วิทยาศาสตร์) — สพป.ปทุมธานี เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100002556668614', 'Miaw Sisai', 'teacher', 'primary', 'ปทุมธานี', 'เขต 1', 'science', 'วิทยาศาสตร์', null, 'https://www.facebook.com/100002556668614', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'พระนครศรีอยุธยา' from t;

-- 10) Khru Puy Wiparat (สังคม) — สพม.ปทุมธานี
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100008412332006', 'Khru Puy Wiparat', 'teacher', 'secondary', 'ปทุมธานี', 'social', 'สังคม', null, 'https://www.facebook.com/100008412332006', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'สระบุรี' from t;

-- 11) CapableRadish9137 (เอกภาษาไทย) — สพป.สมุทรปราการ
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1937547036948617', 'CapableRadish9137', 'teacher', 'primary', 'สมุทรปราการ', 'thai', 'เอกภาษาไทย', null, 'https://www.facebook.com/1937547036948617', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'ปทุมธานี' from t;

-- 12) Suda Rat (เอกวิทย์) — สพป.ปทุมธานี เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100004966963454', 'Suda Rat', 'teacher', 'primary', 'ปทุมธานี', 'เขต 2', 'science', 'เอกวิทย์', null, 'https://www.facebook.com/100004966963454', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ปทุมธานี', 'เขต 1' from t;

-- 13) Pflower500 (คณิตศาสตร์) — สพม.ปทุมธานี
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1029315883098020', 'Pflower500', 'teacher', 'secondary', 'ปทุมธานี', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/1029315883098020', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'นนทบุรี', null from t
union all
select id, 'กรุงเทพมหานคร', null from t;

-- 14) Namtip Wannakan (คณิตศาสตร์) — สพม.ปทุมธานี
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100001601313217', 'Namtip Wannakan', 'teacher', 'secondary', 'ปทุมธานี', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100001601313217', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ปราจีนบุรี', null from t
union all
select id, 'นครนายก', null from t;

-- 15) Krit Pawanan (เอกสังคมศึกษา) — สพม.ปทุมธานี
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100001898983265', 'Krit Pawanan', 'teacher', 'secondary', 'ปทุมธานี', 'social', 'เอกสังคมศึกษา', null, 'https://www.facebook.com/100001898983265', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'นครสวรรค์' from t;

-- 16) หรเขตร์ นนทสรณ์ (วิทย์) — สพม.ปทุมธานี
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100002555709806', 'หรเขตร์ นนทสรณ์', 'teacher', 'secondary', 'ปทุมธานี', 'science', 'วิทย์', null, 'https://www.facebook.com/100002555709806', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'ร้อยเอ็ด' from t;

-- 17) Computer2_69 (คอมพิวเตอร์) — สพป.ชลบุรี เขต 3
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1516996426559274', 'Computer2_69', 'teacher', 'primary', 'ชลบุรี', 'เขต 3', 'occupation_tech', 'คอมพิวเตอร์', null, 'https://www.facebook.com/1516996426559274', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'ปทุมธานี' from t;

-- 18) RadiantBee2814 (เอกวิทยาศาสตร์) — สพป.ปทุมธานี เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:854514091044471', 'RadiantBee2814', 'teacher', 'primary', 'ปทุมธานี', 'เขต 1', 'science', 'เอกวิทยาศาสตร์', null, 'https://www.facebook.com/854514091044471', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'ปทุมธานี' from t;

-- 19) KT Keerataya (เอกภาษาอังกฤษ) — สพป.ประจวบคีรีขันธ์ เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100040569456081', 'KT Keerataya', 'teacher', 'primary', 'ประจวบคีรีขันธ์', 'เขต 1', 'foreign_lang', 'เอกภาษาอังกฤษ', null, 'https://www.facebook.com/100040569456081', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ปทุมธานี', 'เขต 2' from t;

-- 20) Karn Nuttapron (เอกคอม) — สพป.ปทุมธานี เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100039551137256', 'Karn Nuttapron', 'teacher', 'primary', 'ปทุมธานี', 'เขต 2', 'occupation_tech', 'เอกคอม', null, 'https://www.facebook.com/100039551137256', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'พระนครศรีอยุธยา', 'เขต 1' from t
union all
select id, 'ปทุมธานี', 'เขต 1' from t;

-- 21) Pat Mayara (เอกอังกฤษ) — สพม.ปทุมธานี
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100004995696259', 'Pat Mayara', 'teacher', 'secondary', 'ปทุมธานี', 'foreign_lang', 'เอกอังกฤษ', null, 'https://www.facebook.com/100004995696259', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'แพร่', null from t
union all
select id, 'น่าน', null from t
union all
select id, 'ลำปาง', null from t
union all
select id, 'พะเยา', null from t
union all
select id, 'เชียงราย', null from t
union all
select id, 'เชียงใหม่', null from t
union all
select id, 'ลำพูน', null from t
union all
select id, 'สุโขทัย', null from t
union all
select id, 'พิษณุโลก', null from t;

-- 22) ครูสังคมปทุมธานี อยากไปกทม (สังคม) — สพป.ปทุมธานี เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:974353621872195', 'ครูสังคมปทุมธานี อยากไปกทม', 'teacher', 'primary', 'ปทุมธานี', 'เขต 1', 'social', 'สังคม', null, 'https://www.facebook.com/974353621872195', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'กรุงเทพมหานคร' from t;

-- 23) Pem Pimporn Surasit (คณิตศาสตร์) — สพป.ชลบุรี เขต 3
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100007912308225', 'Pem Pimporn Surasit', 'teacher', 'primary', 'ชลบุรี', 'เขต 3', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100007912308225', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ปทุมธานี', 'เขต 1' from t;

-- 24) Monlagan Matman (สังคมศึกษา) — สพป.ปทุมธานี เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100014445184103', 'Monlagan Matman', 'teacher', 'primary', 'ปทุมธานี', 'เขต 2', 'social', 'สังคมศึกษา', null, 'https://www.facebook.com/100014445184103', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'แพร่', null from t
union all
select id, 'ลำปาง', null from t
union all
select id, 'ลำพูน', null from t
union all
select id, 'น่าน', null from t
union all
select id, 'พะเยา', null from t
union all
select id, 'เชียงราย', null from t;

-- 25) Ohm Sikaret Khumchai (เอกคอม) — สพป.ปทุมธานี เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100001277359648', 'Ohm Sikaret Khumchai', 'teacher', 'primary', 'ปทุมธานี', 'เขต 1', 'occupation_tech', 'เอกคอม', null, 'https://www.facebook.com/100001277359648', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'นครราชสีมา' from t;

-- 26) Ice'e Malinee (วิทยาศาสตร์) — สพป.ปทุมธานี เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100003890747135', 'Ice''e Malinee', 'teacher', 'primary', 'ปทุมธานี', 'เขต 2', 'science', 'วิทยาศาสตร์', null, 'https://www.facebook.com/100003890747135', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ระยอง', 'เขต 1' from t
union all
select id, 'ชลบุรี', 'เขต 3' from t;

-- 27) Twoone Smooth (เอกวิทยาศาสตร์) — สพป.ชลบุรี เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100024764070173', 'Twoone Smooth', 'teacher', 'primary', 'ชลบุรี', 'เขต 1', 'science', 'เอกวิทยาศาสตร์', null, 'https://www.facebook.com/100024764070173', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'ปทุมธานี' from t;

-- 28) Waratchaya Chawalit (เอกคอม) — สพป.ปทุมธานี เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100000099917050', 'Waratchaya Chawalit', 'teacher', 'primary', 'ปทุมธานี', 'เขต 2', 'occupation_tech', 'เอกคอม', null, 'https://www.facebook.com/100000099917050', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'อ่างทอง' from t;

-- 29) Non Patithan (สังคมศึกษา) — สพป.นครราชสีมา เขต 4
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100006465624537', 'Non Patithan', 'teacher', 'primary', 'นครราชสีมา', 'เขต 4', 'social', 'สังคมศึกษา', null, 'https://www.facebook.com/100006465624537', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ปทุมธานี', 'เขต 1' from t;

-- 30) Pattraporn Sangdang (เอกอิ้ง) — สพป.ปทุมธานี เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100000074941183', 'Pattraporn Sangdang', 'teacher', 'primary', 'ปทุมธานี', 'เขต 1', 'foreign_lang', 'เอกอิ้ง', null, 'https://www.facebook.com/100000074941183', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'ปทุมธานี' from t;

-- 31) Maii Zeed (พลศึกษา) — สพป.ปทุมธานี เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100002423874792', 'Maii Zeed', 'teacher', 'primary', 'ปทุมธานี', 'เขต 1', 'health_pe', 'พลศึกษา', null, 'https://www.facebook.com/100002423874792', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'พระนครศรีอยุธยา', 'เขต 2' from t;

-- 32) ครูคอมชลบุรี ย้ายไปกทม (คอมพิวเตอร์) — สพม.ชลบุรี
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:61575483950927', 'ครูคอมชลบุรี ย้ายไปกทม', 'teacher', 'secondary', 'ชลบุรี', 'occupation_tech', 'คอมพิวเตอร์', null, 'https://www.facebook.com/61575483950927', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'ปทุมธานี' from t;

-- 33) Chayanee Sungchaiyapoom (เอกคณิตศาสตร์) — สพป.ปทุมธานี เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100001493568185', 'Chayanee Sungchaiyapoom', 'teacher', 'primary', 'ปทุมธานี', 'เขต 1', 'math', 'เอกคณิตศาสตร์', null, 'https://www.facebook.com/100001493568185', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'ปทุมธานี' from t;

-- 34) Aum Iris (ภาษาไทย) — สพม.ปทุมธานี
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100070390312655', 'Aum Iris', 'teacher', 'secondary', 'ปทุมธานี', 'thai', 'ภาษาไทย', null, 'https://www.facebook.com/100070390312655', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ปราจีนบุรี', null from t
union all
select id, 'นครนายก', null from t;

-- 35) Nuengruetai Chinthanam (ภาษาไทย) — สพป.ขอนแก่น เขต 5
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100001445329513', 'Nuengruetai Chinthanam', 'teacher', 'primary', 'ขอนแก่น', 'เขต 5', 'thai', 'ภาษาไทย', null, 'https://www.facebook.com/100001445329513', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ปทุมธานี', 'เขต 1' from t;

-- 36) Ump Amethyst (ภาษาอังกฤษ) — สพป.ปทุมธานี เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1443992194', 'Ump Amethyst', 'teacher', 'primary', 'ปทุมธานี', 'เขต 2', 'foreign_lang', 'ภาษาอังกฤษ', null, 'https://www.facebook.com/1443992194', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ปทุมธานี', null from t
union all
select id, 'พระนครศรีอยุธยา', 'เขต 1' from t;

-- 37) ResilientCrocodile6179 (เอกคอม) — สพป.ปทุมธานี เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:2309178516577361', 'ResilientCrocodile6179', 'teacher', 'primary', 'ปทุมธานี', 'เขต 1', 'occupation_tech', 'เอกคอม', null, 'https://www.facebook.com/2309178516577361', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'พระนครศรีอยุธยา', 'เขต 1' from t;

-- 38) SageSunflower8406 (เอกคณิตศาสตร์) — สพป.ยโสธร เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1357884996220451', 'SageSunflower8406', 'teacher', 'primary', 'ยโสธร', 'เขต 1', 'math', 'เอกคณิตศาสตร์', null, 'https://www.facebook.com/1357884996220451', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ปทุมธานี', 'เขต 1' from t;

-- 39) Kun Kunsuda (เอกนาฏศิลป์) — สพป.พิษณุโลก เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100001100168488', 'Kun Kunsuda', 'teacher', 'primary', 'พิษณุโลก', 'เขต 2', 'art', 'เอกนาฏศิลป์', null, 'https://www.facebook.com/100001100168488', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'ปทุมธานี' from t;

-- 40) StunningCapybara6676 (เอกวิทย์) — สพป.ชัยภูมิ เขต 3
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:997281623100384', 'StunningCapybara6676', 'teacher', 'primary', 'ชัยภูมิ', 'เขต 3', 'science', 'เอกวิทย์', null, 'https://www.facebook.com/997281623100384', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ปทุมธานี', 'เขต 1' from t;

-- 41) Eye Aunchisa (ภาษาไทย) — สพป.ราชบุรี เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100002831841596', 'Eye Aunchisa', 'teacher', 'primary', 'ราชบุรี', 'เขต 2', 'thai', 'ภาษาไทย', null, 'https://www.facebook.com/100002831841596', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ปทุมธานี', 'เขต 2' from t;

-- 42) GorgeousLadybug6233 (เอกอุตสาหกรรมศิลป์) — สพม.กรุงเทพมหานคร เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1035568955822128', 'GorgeousLadybug6233', 'teacher', 'secondary', 'กรุงเทพมหานคร', 'เขต 1', 'occupation_tech', 'เอกอุตสาหกรรมศิลป์', null, 'https://www.facebook.com/1035568955822128', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'ปทุมธานี' from t;

-- 43) KG KrooGolf Nakhon Pathom (เอกพละศึกษา) — สพป.นครปฐม เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100000844803884', 'KG KrooGolf Nakhon Pathom', 'teacher', 'primary', 'นครปฐม', 'เขต 1', 'health_pe', 'เอกพละศึกษา', null, 'https://www.facebook.com/100000844803884', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ปทุมธานี', 'เขต 2' from t;

-- 44) ExhilaratingLlama1075 (เอกอุตสาหกรรมศิลป์) — สพม.สมุทรสาคร
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1533806928441295', 'ExhilaratingLlama1075', 'teacher', 'secondary', 'สมุทรสาคร', 'occupation_tech', 'เอกอุตสาหกรรมศิลป์', null, 'https://www.facebook.com/1533806928441295', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ราชบุรี', null from t
union all
select id, 'นครปฐม', null from t
union all
select id, 'กาญจนบุรี', null from t;

-- 45) Koong Supatchara (เอกสังคม) — สพม.ปทุมธานี
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100000091412921', 'Koong Supatchara', 'teacher', 'secondary', 'ปทุมธานี', 'social', 'เอกสังคม', null, 'https://www.facebook.com/100000091412921', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'ลพบุรี' from t;

-- 46) DecisiveRadish2567 (เอกภาษาอังกฤษ) — สพม.สระบุรี
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1132405582451084', 'DecisiveRadish2567', 'teacher', 'secondary', 'สระบุรี', 'foreign_lang', 'เอกภาษาอังกฤษ', null, 'https://www.facebook.com/1132405582451084', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'ปทุมธานี' from t;

-- 47) Issra Seri (เอกสังคม) — สพม.เชียงใหม่
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:61556463165019', 'Issra Seri', 'teacher', 'secondary', 'เชียงใหม่', 'social', 'เอกสังคม', null, 'https://www.facebook.com/61556463165019', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ปทุมธานี', null from t
union all
select id, 'พระนครศรีอยุธยา', null from t
union all
select id, 'นครปฐม', null from t;
