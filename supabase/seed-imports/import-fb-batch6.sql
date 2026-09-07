-- Seed import batch 6: mined from the 'เอกคณิตศาสตร์ มารวมกันตรงนี้ครับ' megathread
-- (Adisorn Nilrasamee's post) that the user pasted in full with FB profile links.
-- 3 names were excluded despite identical content to already-imported records
-- (SageSunflower8406, GoldJaguar5111, PurplePanda9632) because the FB id in their
-- link here did not match the id recorded in the earlier batch — flagged for the
-- user to review rather than guessed at.
-- line_user_id uses 'seed:fb:<facebook id>' placeholders, never reachable by
-- a real LINE login. Each gets an invite_code so the real person can later
-- claim their record via /join/<code> (see lib/invites.ts).
-- To remove this batch: delete from teachers where line_user_id = any(array[
--   'seed:fb:1329957918675606', 'seed:fb:100001393296939', 'seed:fb:2012811036266178', 'seed:fb:1469445531567482', 'seed:fb:100004473481972', 'seed:fb:1769904247380085', 'seed:fb:100034968192705', 'seed:fb:1536363197781903', 'seed:fb:1567021081606424', 'seed:fb:27239059235787108', 'seed:fb:2929920034025386', 'seed:fb:4325932677720211', 'seed:fb:1022625573835531', 'seed:fb:2074212090646505', 'seed:fb:1222477213341881', 'seed:fb:1058972950413983', 'seed:fb:1409784164311220', 'seed:fb:1492449842187813', 'seed:fb:1191273114072191', 'seed:fb:1946508676007864', 'seed:fb:1343791234510976', 'seed:fb:782195771587784', 'seed:fb:1733977837927717', 'seed:fb:100002024091391', 'seed:fb:100003399221232', 'seed:fb:100002650058012', 'seed:fb:100022566885227', 'seed:fb:100003466939032', 'seed:fb:100008966051507', 'seed:fb:3018831815136616', 'seed:fb:100003370429879', 'seed:fb:100007257784374', 'seed:fb:100004203580638', 'seed:fb:100001868944449', 'seed:fb:100004046718140', 'seed:fb:100001337137404', 'seed:fb:100005312263486', 'seed:fb:100000167411338', 'seed:fb:100006836057721', 'seed:fb:100001427118306', 'seed:fb:100028052437469', 'seed:fb:100002560137797', 'seed:fb:100001416436468', 'seed:fb:100002516413093', 'seed:fb:100001645312273', 'seed:fb:100000644885159', 'seed:fb:100002513052070', 'seed:fb:100010517070371', 'seed:fb:100004734930840', 'seed:fb:100001513944204', 'seed:fb:100004091511494', 'seed:fb:100001511194072', 'seed:fb:100006273422300', 'seed:fb:100053118315399', 'seed:fb:100001591028683', 'seed:fb:100001477669016', 'seed:fb:100009516821393', 'seed:fb:100000727179070', 'seed:fb:100023050689785', 'seed:fb:1439768425', 'seed:fb:100002504853616', 'seed:fb:100002768891835', 'seed:fb:100004044207122', 'seed:fb:100005856430206', 'seed:fb:100004384893958', 'seed:fb:100002648561488', 'seed:fb:100007584102654', 'seed:fb:100006263853791', 'seed:fb:100003781888968', 'seed:fb:100001878481692', 'seed:fb:100001878703125', 'seed:fb:100001899634451', 'seed:fb:100003666573383', 'seed:fb:1508641360991080', 'seed:fb:1724417691901473', 'seed:fb:997588586217303', 'seed:fb:100001705345774', 'seed:fb:100007114060086', 'seed:fb:1805177190479970', 'seed:fb:985745217556023', 'seed:fb:1052367407236575', 'seed:fb:2207363703347617', 'seed:fb:1328267899415205', 'seed:fb:1460562879098227', 'seed:fb:1381067920549144', 'seed:fb:1570420564733934', 'seed:fb:1031963906006084', 'seed:fb:2083229145878879', 'seed:fb:1686627769270916', 'seed:fb:100001406970627', 'seed:fb:1598435444945502', 'seed:fb:100002516874370', 'seed:fb:100004050137478', 'seed:fb:100003991301629', 'seed:fb:100050995311127', 'seed:fb:100001868515142', 'seed:fb:100010060786324', 'seed:fb:100002120616717', 'seed:fb:100045729972023', 'seed:fb:100003358149851', 'seed:fb:100001991064515', 'seed:fb:100001864780496', 'seed:fb:100008403049478', 'seed:fb:100076694385268', 'seed:fb:100001151008479', 'seed:fb:100001186491820', 'seed:fb:100010132898064']);

-- 1) AttractiveParrot7606 (คณิตศาสตร์) — สพม.นครปฐม
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1329957918675606', 'AttractiveParrot7606', 'teacher', 'secondary', 'นครปฐม', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/1329957918675606', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'นครปฐม', null from t
union all
select id, 'ราชบุรี', null from t;

-- 2) First'Top Poltep (คณิตศาสตร์) — สพป.นครนายก
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100001393296939', 'First''Top Poltep', 'teacher', 'primary', 'นครนายก', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100001393296939', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'นนทบุรี' from t;

-- 3) OrangeFalcon7380 (คณิตศาสตร์) — สพป.กรุงเทพมหานคร
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:2012811036266178', 'OrangeFalcon7380', 'teacher', 'primary', 'กรุงเทพมหานคร', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/2012811036266178', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'นครปฐม', null from t
union all
select id, 'นนทบุรี', null from t;

-- 4) RedAsparagus5604 (คณิตศาสตร์) — สพป.ชัยภูมิ เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1469445531567482', 'RedAsparagus5604', 'teacher', 'primary', 'ชัยภูมิ', 'เขต 1', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/1469445531567482', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'หนองบัวลำภู' from t;

-- 5) Yongyuth Tennyson (คณิตศาสตร์) — สพม.นครราชสีมา
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100004473481972', 'Yongyuth Tennyson', 'teacher', 'secondary', 'นครราชสีมา', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100004473481972', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'ขอนแก่น' from t;

-- 6) EagerCaribou6309 (คณิตศาสตร์) — สพม.กรุงเทพมหานคร เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1769904247380085', 'EagerCaribou6309', 'teacher', 'secondary', 'กรุงเทพมหานคร', 'เขต 1', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/1769904247380085', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'มหาสารคาม' from t;

-- 7) Pawa Pa (คณิตศาสตร์) — สพม.ร้อยเอ็ด
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100034968192705', 'Pawa Pa', 'teacher', 'secondary', 'ร้อยเอ็ด', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100034968192705', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'สมุทรปราการ' from t;

-- 8) PositiveMango9006 (คณิตศาสตร์) — สพม.สมุทรปราการ
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1536363197781903', 'PositiveMango9006', 'teacher', 'secondary', 'สมุทรปราการ', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/1536363197781903', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'กรุงเทพมหานคร', 'เขต 1' from t;

-- 9) DevidRed28 (คณิตศาสตร์) — สพม.นครพนม
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1567021081606424', 'DevidRed28', 'teacher', 'secondary', 'นครพนม', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/1567021081606424', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'อุบลราชธานี' from t;

-- 10) CharmingGoose4009 (คณิตศาสตร์) — สพป.จันทบุรี เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:27239059235787108', 'CharmingGoose4009', 'teacher', 'primary', 'จันทบุรี', 'เขต 2', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/27239059235787108', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'จันทบุรี', null from t
union all
select id, 'ระยอง', 'เขต 2' from t;

-- 11) Mubin1235 (คณิตศาสตร์) — สพป.ประจวบคีรีขันธ์ เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:2929920034025386', 'Mubin1235', 'teacher', 'primary', 'ประจวบคีรีขันธ์', 'เขต 1', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/2929920034025386', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ชุมพร', 'เขต 1' from t;

-- 12) CapableFish7085 (คณิตศาสตร์) — สพป.อุตรดิตถ์ เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:4325932677720211', 'CapableFish7085', 'teacher', 'primary', 'อุตรดิตถ์', 'เขต 2', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/4325932677720211', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'อุตรดิตถ์', 'เขต 1' from t;

-- 13) ResilientPeacock1309 (คณิตศาสตร์) — สพป.กาฬสินธุ์ เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1022625573835531', 'ResilientPeacock1309', 'teacher', 'primary', 'กาฬสินธุ์', 'เขต 2', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/1022625573835531', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'กาฬสินธุ์' from t;

-- 14) AdventurousWolf8966 (คณิตศาสตร์) — สพม.กรุงเทพมหานคร เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:2074212090646505', 'AdventurousWolf8966', 'teacher', 'secondary', 'กรุงเทพมหานคร', 'เขต 1', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/2074212090646505', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'กรุงเทพมหานคร', 'เขต 2' from t;

-- 15) HappyHeron9321 (คณิตศาสตร์) — สพม.ชลบุรี
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1222477213341881', 'HappyHeron9321', 'teacher', 'secondary', 'ชลบุรี', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/1222477213341881', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'นครราชสีมา' from t;

-- 16) ConfidentBeet8292 (คณิตศาสตร์) — สพป.เชียงใหม่ เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1058972950413983', 'ConfidentBeet8292', 'teacher', 'primary', 'เชียงใหม่', 'เขต 2', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/1058972950413983', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'เชียงใหม่', null from t
union all
select id, 'ลำพูน', 'เขต 1' from t;

-- 17) TurquoiseElephant621 (คณิตศาสตร์) — สพป.กาฬสินธุ์ เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1409784164311220', 'TurquoiseElephant621', 'teacher', 'primary', 'กาฬสินธุ์', 'เขต 1', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/1409784164311220', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ยโสธร', 'เขต 1' from t;

-- 18) Thiti888888 (คณิตศาสตร์) — สพป.นครราชสีมา เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1492449842187813', 'Thiti888888', 'teacher', 'primary', 'นครราชสีมา', 'เขต 1', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/1492449842187813', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'กาฬสินธุ์' from t;

-- 19) CharmingPoodle1906 (คณิตศาสตร์) — สพป.สระบุรี เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1191273114072191', 'CharmingPoodle1906', 'teacher', 'primary', 'สระบุรี', 'เขต 2', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/1191273114072191', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ปทุมธานี', 'เขต 1' from t;

-- 20) drogonkiki (คณิตศาสตร์) — สพป.เชียงราย เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1946508676007864', 'drogonkiki', 'teacher', 'primary', 'เชียงราย', 'เขต 2', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/1946508676007864', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'พะเยา', null from t
union all
select id, 'เชียงราย', 'เขต 4' from t;

-- 21) FascinatingMouse7566 (คณิตศาสตร์) — สพป.ขอนแก่น เขต 5
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1343791234510976', 'FascinatingMouse7566', 'teacher', 'primary', 'ขอนแก่น', 'เขต 5', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/1343791234510976', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'กาฬสินธุ์', null from t
union all
select id, 'มหาสารคาม', 'เขต 1' from t
union all
select id, 'ขอนแก่น', 'เขต 1' from t;

-- 22) InspiringBison6084 (คณิตศาสตร์) — สพป.อุดรธานี เขต 4
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:782195771587784', 'InspiringBison6084', 'teacher', 'primary', 'อุดรธานี', 'เขต 4', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/782195771587784', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'สุรินทร์' from t;

-- 23) DelightfulChestnut537 (คณิตศาสตร์) — สพป.ชัยภูมิ เขต 3
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1733977837927717', 'DelightfulChestnut537', 'teacher', 'primary', 'ชัยภูมิ', 'เขต 3', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/1733977837927717', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ชัยภูมิ', 'เขต 2' from t;

-- 24) Haneen Ding (คณิตศาสตร์) — สพป.ปัตตานี เขต 3
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100002024091391', 'Haneen Ding', 'teacher', 'primary', 'ปัตตานี', 'เขต 3', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100002024091391', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ยะลา', 'เขต 1' from t
union all
select id, 'ปัตตานี', 'เขต 2' from t;

-- 25) Muy Sujita (คณิตศาสตร์) — สพป.หนองคาย เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100003399221232', 'Muy Sujita', 'teacher', 'primary', 'หนองคาย', 'เขต 2', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100003399221232', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ร้อยเอ็ด', 'เขต 2' from t;

-- 26) อิง อิง (คณิตศาสตร์) — สพป.นครสวรรค์ เขต 3
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100002650058012', 'อิง อิง', 'teacher', 'primary', 'นครสวรรค์', 'เขต 3', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100002650058012', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'นครสวรรค์', 'เขต 2' from t;

-- 27) Shapsin Panchompoo (คณิตศาสตร์) — สพป.บึงกาฬ
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100022566885227', 'Shapsin Panchompoo', 'teacher', 'primary', 'บึงกาฬ', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100022566885227', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'อุดรธานี', 'เขต 2' from t;

-- 28) Chatruedi Sribunrueang (คณิตศาสตร์) — สพป.ศรีสะเกษ เขต 4
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100003466939032', 'Chatruedi Sribunrueang', 'teacher', 'primary', 'ศรีสะเกษ', 'เขต 4', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100003466939032', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ศรีสะเกษ', 'เขต 4' from t;

-- 29) Bor Boss (คณิตศาสตร์) — สพป.บึงกาฬ
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100008966051507', 'Bor Boss', 'teacher', 'primary', 'บึงกาฬ', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100008966051507', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'กาฬสินธุ์', 'เขต 3' from t;

-- 30) ConfidentPineapple4764 (คณิตศาสตร์) — สพป.สิงห์บุรี
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:3018831815136616', 'ConfidentPineapple4764', 'teacher', 'primary', 'สิงห์บุรี', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/3018831815136616', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'สมุทรปราการ', 'เขต 2' from t;

-- 31) Sarinya Krukah (คณิตศาสตร์) — สพป.สงขลา เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100003370429879', 'Sarinya Krukah', 'teacher', 'primary', 'สงขลา', 'เขต 2', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100003370429879', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'สตูล' from t;

-- 32) Parichat Dibprakhon (คณิตศาสตร์) — สพป.นครราชสีมา เขต 6
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100007257784374', 'Parichat Dibprakhon', 'teacher', 'primary', 'นครราชสีมา', 'เขต 6', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100007257784374', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'นครราชสีมา', 'เขต 1' from t;

-- 33) Inthira Warunnarong (คณิตศาสตร์) — สพป.สระบุรี เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100004203580638', 'Inthira Warunnarong', 'teacher', 'primary', 'สระบุรี', 'เขต 2', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100004203580638', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'พิษณุโลก' from t;

-- 34) Worapong Seemai (คณิตศาสตร์) — สพป.นนทบุรี เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100001868944449', 'Worapong Seemai', 'teacher', 'primary', 'นนทบุรี', 'เขต 1', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100001868944449', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'พิษณุโลก', null from t
union all
select id, 'สุโขทัย', null from t;

-- 35) Sunisa Wangmue (คณิตศาสตร์) — สพป.นครสวรรค์ เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100004046718140', 'Sunisa Wangmue', 'teacher', 'primary', 'นครสวรรค์', 'เขต 1', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100004046718140', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ลำปาง', null from t
union all
select id, 'เชียงใหม่', null from t
union all
select id, 'เชียงราย', null from t;

-- 36) Phatchaya Kanrew (คณิตศาสตร์) — สพป.กำแพงเพชร เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100001337137404', 'Phatchaya Kanrew', 'teacher', 'primary', 'กำแพงเพชร', 'เขต 1', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100001337137404', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'พะเยา', 'เขต 1' from t;

-- 37) Mhon Mhon (คณิตศาสตร์) — สพป.กระบี่
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100005312263486', 'Mhon Mhon', 'teacher', 'primary', 'กระบี่', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100005312263486', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'สงขลา' from t;

-- 38) Nuch Nira (คณิตศาสตร์) — สพป.อุดรธานี เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100000167411338', 'Nuch Nira', 'teacher', 'primary', 'อุดรธานี', 'เขต 1', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100000167411338', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'อุดรธานี', 'เขต 3' from t;

-- 39) เสาวลักษณ์ อุปไชย (คณิตศาสตร์) — สพป.สกลนคร เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100006836057721', 'เสาวลักษณ์ อุปไชย', 'teacher', 'primary', 'สกลนคร', 'เขต 2', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100006836057721', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'สกลนคร', 'เขต 3' from t;

-- 40) Jai-Thaosirithada Worapan (คณิตศาสตร์) — สพป.หนองคาย เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100001427118306', 'Jai-Thaosirithada Worapan', 'teacher', 'primary', 'หนองคาย', 'เขต 2', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100001427118306', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'น่าน', null from t
union all
select id, 'แพร่', null from t
union all
select id, 'พะเยา', null from t;

-- 41) Pim Suwanan (คณิตศาสตร์) — สพป.พิจิตร เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100028052437469', 'Pim Suwanan', 'teacher', 'primary', 'พิจิตร', 'เขต 2', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100028052437469', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'กำแพงเพชร', 'เขต 1' from t;

-- 42) Rattanasin Srinam (คณิตศาสตร์) — สพม.ชลบุรี
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100002560137797', 'Rattanasin Srinam', 'teacher', 'secondary', 'ชลบุรี', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100002560137797', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'กำแพงเพชร' from t;

-- 43) MOonuy Rapromma (คณิตศาสตร์) — สพม.ขอนแก่น
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100001416436468', 'MOonuy Rapromma', 'teacher', 'secondary', 'ขอนแก่น', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100001416436468', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'ขอนแก่น' from t;

-- 44) Therese Ploy (คณิตศาสตร์) — สพป.สกลนคร เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100002516413093', 'Therese Ploy', 'teacher', 'primary', 'สกลนคร', 'เขต 2', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100002516413093', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'สกลนคร', 'เขต 1' from t;

-- 45) B'Fern Panuchanad (คณิตศาสตร์) — สพป.อุบลราชธานี เขต 5
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100001645312273', 'B''Fern Panuchanad', 'teacher', 'primary', 'อุบลราชธานี', 'เขต 5', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100001645312273', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'สุรินทร์', 'เขต 1' from t;

-- 46) Netnapis Sukplung (คณิตศาสตร์) — สพป.สุพรรณบุรี เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100000644885159', 'Netnapis Sukplung', 'teacher', 'primary', 'สุพรรณบุรี', 'เขต 1', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100000644885159', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'สระบุรี' from t;

-- 47) Kruduk MathLab (คณิตศาสตร์) — สพม.นครพนม
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100002513052070', 'Kruduk MathLab', 'teacher', 'secondary', 'นครพนม', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100002513052070', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'นครพนม' from t;

-- 48) Mink Hataikan (คณิตศาสตร์) — สพป.สุโขทัย เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100010517070371', 'Mink Hataikan', 'teacher', 'primary', 'สุโขทัย', 'เขต 1', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100010517070371', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'พิษณุโลก' from t;

-- 49) Rainy Season (คณิตศาสตร์) — สพป.เชียงใหม่ เขต 3
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100004734930840', 'Rainy Season', 'teacher', 'primary', 'เชียงใหม่', 'เขต 3', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100004734930840', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'ลำปาง' from t;

-- 50) Khwanjai Thongsang (คณิตศาสตร์) — สพป.นครปฐม เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100001513944204', 'Khwanjai Thongsang', 'teacher', 'primary', 'นครปฐม', 'เขต 1', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100001513944204', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'นครปฐม', 'เขต 1' from t;

-- 51) Teppituk Suwannarach (คณิตศาสตร์) — สพป.สกลนคร เขต 3
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100004091511494', 'Teppituk Suwannarach', 'teacher', 'primary', 'สกลนคร', 'เขต 3', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100004091511494', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'สกลนคร', 'เขต 2' from t;

-- 52) Pontip Tongduang (คณิตศาสตร์) — สพม.ตาก
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100001511194072', 'Pontip Tongduang', 'teacher', 'secondary', 'ตาก', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100001511194072', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'นครปฐม', null from t
union all
select id, 'สมุทรสาคร', null from t;

-- 53) โลก สีเทา (คณิตศาสตร์) — สพป.ชัยภูมิ เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100006273422300', 'โลก สีเทา', 'teacher', 'primary', 'ชัยภูมิ', 'เขต 1', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100006273422300', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ขอนแก่น', 'เขต 4' from t;

-- 54) หนูดาว เป็นลูกสาวกก (คณิตศาสตร์) — สพป.อำนาจเจริญ
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100053118315399', 'หนูดาว เป็นลูกสาวกก', 'teacher', 'primary', 'อำนาจเจริญ', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100053118315399', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'อำนาจเจริญ' from t;

-- 55) Apinya Bee Tongsena (คณิตศาสตร์) — สพป.ชุมพร เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100001591028683', 'Apinya Bee Tongsena', 'teacher', 'primary', 'ชุมพร', 'เขต 2', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100001591028683', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ชลบุรี', null from t
union all
select id, 'ระยอง', null from t;

-- 56) Ampon Si (คณิตศาสตร์) — สพป.บุรีรัมย์ เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100001477669016', 'Ampon Si', 'teacher', 'primary', 'บุรีรัมย์', 'เขต 2', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100001477669016', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'สุรินทร์', 'เขต 3' from t;

-- 57) Fon Phrapidet (คณิตศาสตร์) — สพป.อุดรธานี เขต 3
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100009516821393', 'Fon Phrapidet', 'teacher', 'primary', 'อุดรธานี', 'เขต 3', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100009516821393', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'อุดรธานี', 'เขต 1' from t;

-- 58) Nutthapon Kaewthung (คณิตศาสตร์) — สพป.พิษณุโลก เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100000727179070', 'Nutthapon Kaewthung', 'teacher', 'primary', 'พิษณุโลก', 'เขต 2', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100000727179070', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'สุโขทัย' from t;

-- 59) Amm Boonyasa (คณิตศาสตร์) — สพป.อุตรดิตถ์ เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100023050689785', 'Amm Boonyasa', 'teacher', 'primary', 'อุตรดิตถ์', 'เขต 1', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100023050689785', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'สุโขทัย' from t;

-- 60) ฟา ริด (คณิตศาสตร์) — สพป.ปัตตานี เขต 3
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1439768425', 'ฟา ริด', 'teacher', 'primary', 'ปัตตานี', 'เขต 3', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/1439768425', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'ปัตตานี' from t;

-- 61) Tinnapop K Duangiad (คณิตศาสตร์) — สพป.พัทลุง เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100002504853616', 'Tinnapop K Duangiad', 'teacher', 'primary', 'พัทลุง', 'เขต 2', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100002504853616', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'พัทลุง', 'เขต 1' from t;

-- 62) Natthapong Khunglung (คณิตศาสตร์) — สพป.สมุทรสาคร
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100002768891835', 'Natthapong Khunglung', 'teacher', 'primary', 'สมุทรสาคร', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100002768891835', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ราชบุรี', 'เขต 1' from t;

-- 63) Fang Satida Leethong (คณิตศาสตร์) — สพป.ขอนแก่น เขต 5
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100004044207122', 'Fang Satida Leethong', 'teacher', 'primary', 'ขอนแก่น', 'เขต 5', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100004044207122', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ขอนแก่น', 'เขต 1' from t;

-- 64) Sakulkes Krasaesom (คณิตศาสตร์) — สพป.ระยอง เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100005856430206', 'Sakulkes Krasaesom', 'teacher', 'primary', 'ระยอง', 'เขต 1', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100005856430206', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ชลบุรี', null from t
union all
select id, 'ระยอง', 'เขต 1' from t;

-- 65) Wun Sunsanee (คณิตศาสตร์) — สพป.นครปฐม เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100004384893958', 'Wun Sunsanee', 'teacher', 'primary', 'นครปฐม', 'เขต 2', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100004384893958', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'นครปฐม', 'เขต 1' from t;

-- 66) Ayusah Yusohmayu (เอกคณิตศาสตร์) — สพป.นราธิวาส เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100002648561488', 'Ayusah Yusohmayu', 'teacher', 'primary', 'นราธิวาส', 'เขต 1', 'math', 'เอกคณิตศาสตร์', null, 'https://www.facebook.com/100002648561488', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'นราธิวาส', 'เขต 3' from t;

-- 67) M.G. Sutthiphong (คณิตศาสตร์) — สพป.อุดรธานี เขต 3
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100007584102654', 'M.G. Sutthiphong', 'teacher', 'primary', 'อุดรธานี', 'เขต 3', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100007584102654', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'สกลนคร' from t;

-- 68) สายฝน ทรัพย์สิน (คณิตศาสตร์) — สพป.กำแพงเพชร เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100006263853791', 'สายฝน ทรัพย์สิน', 'teacher', 'primary', 'กำแพงเพชร', 'เขต 1', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100006263853791', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'กำแพงเพชร', 'เขต 2' from t;

-- 69) Ladawan Nueanglee (คณิตศาสตร์) — สพป.นครพนม เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100003781888968', 'Ladawan Nueanglee', 'teacher', 'primary', 'นครพนม', 'เขต 1', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100003781888968', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'บึงกาฬ' from t;

-- 70) Poppy Pawinee (คณิตศาสตร์) — สพป.อุดรธานี เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100001878481692', 'Poppy Pawinee', 'teacher', 'primary', 'อุดรธานี', 'เขต 1', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100001878481692', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'อุดรธานี' from t;

-- 71) สุภิวัฒน์ บัวศรีแก้ว (คณิตศาสตร์) — สพป.กาญจนบุรี เขต 3
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100001878703125', 'สุภิวัฒน์ บัวศรีแก้ว', 'teacher', 'primary', 'กาญจนบุรี', 'เขต 3', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100001878703125', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ลพบุรี', 'เขต 2' from t;

-- 72) Mareena Cheuma (คณิตศาสตร์) — สพป.กระบี่
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100001899634451', 'Mareena Cheuma', 'teacher', 'primary', 'กระบี่', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100001899634451', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'นราธิวาส' from t;

-- 73) Narongrith R. Intharawetwilai (คณิตศาสตร์) — สพป.นครปฐม เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100003666573383', 'Narongrith R. Intharawetwilai', 'teacher', 'primary', 'นครปฐม', 'เขต 1', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100003666573383', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'นครปฐม' from t;

-- 74) EfficientRaspberry4624 (คณิตศาสตร์) — สพป.ราชบุรี เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1508641360991080', 'EfficientRaspberry4624', 'teacher', 'primary', 'ราชบุรี', 'เขต 1', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/1508641360991080', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'ราชบุรี' from t;

-- 75) CaptivatingFlower8919 (เอกคณิต) — สพม.กรุงเทพมหานคร เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1724417691901473', 'CaptivatingFlower8919', 'teacher', 'secondary', 'กรุงเทพมหานคร', 'เขต 2', 'math', 'เอกคณิต', null, 'https://www.facebook.com/1724417691901473', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'กรุงเทพมหานคร', 'เขต 1' from t;

-- 76) BlueFish3585 (คณิตศาสตร์) — สพป.มุกดาหาร
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:997588586217303', 'BlueFish3585', 'teacher', 'primary', 'มุกดาหาร', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/997588586217303', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'มุกดาหาร' from t;

-- 77) Mild Panithi (คณิตศาสตร์) — สพป.พิษณุโลก เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100001705345774', 'Mild Panithi', 'teacher', 'primary', 'พิษณุโลก', 'เขต 2', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100001705345774', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ลำพูน', null from t
union all
select id, 'ลำปาง', null from t
union all
select id, 'เชียงใหม่', null from t;

-- 78) Pongpat Yoyram (คณิตศาสตร์) — สพป.สุรินทร์ เขต 3
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100007114060086', 'Pongpat Yoyram', 'teacher', 'primary', 'สุรินทร์', 'เขต 3', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100007114060086', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'บุรีรัมย์', 'เขต 4' from t;

-- 79) ConfidentRabbit6557 (คณิตศาสตร์) — สพป.ร้อยเอ็ด เขต 3
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1805177190479970', 'ConfidentRabbit6557', 'teacher', 'primary', 'ร้อยเอ็ด', 'เขต 3', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/1805177190479970', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'ร้อยเอ็ด' from t;

-- 80) IntelligentGuava2060 (คณิตศาสตร์) — สพม.สมุทรปราการ
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:985745217556023', 'IntelligentGuava2060', 'teacher', 'secondary', 'สมุทรปราการ', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/985745217556023', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'สุพรรณบุรี', null from t
union all
select id, 'นนทบุรี', null from t
union all
select id, 'ปทุมธานี', null from t;

-- 81) ScenicArugula6719 (คณิตศาสตร์) — สพป.สกลนคร เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1052367407236575', 'ScenicArugula6719', 'teacher', 'primary', 'สกลนคร', 'เขต 2', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/1052367407236575', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'สกลนคร', 'เขต 2' from t;

-- 82) RedLynx6304 (คณิตศาสตร์) — สพป.ศรีสะเกษ เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:2207363703347617', 'RedLynx6304', 'teacher', 'primary', 'ศรีสะเกษ', 'เขต 2', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/2207363703347617', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ยโสธร', 'เขต 1' from t;

-- 83) Mp (คณิตศาสตร์) — สพป.เชียงใหม่ เขต 6
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1328267899415205', 'Mp', 'teacher', 'primary', 'เชียงใหม่', 'เขต 6', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/1328267899415205', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'แพร่', null from t
union all
select id, 'ลำปาง', null from t
union all
select id, 'น่าน', null from t;

-- 84) EmeraldBlueberry3192 (คณิตศาสตร์) — สพม.กรุงเทพมหานคร เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1460562879098227', 'EmeraldBlueberry3192', 'teacher', 'secondary', 'กรุงเทพมหานคร', 'เขต 1', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/1460562879098227', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'แพร่' from t;

-- 85) MemorableLlama8822 (คณิตศาสตร์) — สพม.อุทัยธานี
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1381067920549144', 'MemorableLlama8822', 'teacher', 'secondary', 'อุทัยธานี', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/1381067920549144', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'นครสวรรค์' from t;

-- 86) MotivatedRambutan5826 (เอกคณิตศาสตร์) — สพป.นครพนม เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1570420564733934', 'MotivatedRambutan5826', 'teacher', 'primary', 'นครพนม', 'เขต 1', 'math', 'เอกคณิตศาสตร์', null, 'https://www.facebook.com/1570420564733934', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'นครพนม' from t;

-- 87) GorgeousSeahorse9012 (คณิตศาสตร์) — สพป.หนองบัวลำภู เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1031963906006084', 'GorgeousSeahorse9012', 'teacher', 'primary', 'หนองบัวลำภู', 'เขต 1', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/1031963906006084', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'หนองบัวลำภู', 'เขต 2' from t;

-- 88) TaupeElk548 (คณิตศาสตร์) — สพป.สกลนคร เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:2083229145878879', 'TaupeElk548', 'teacher', 'primary', 'สกลนคร', 'เขต 2', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/2083229145878879', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'สกลนคร', 'เขต 1' from t;

-- 89) CopperDeer5018 (คณิตศาสตร์) — สพม.อุบลราชธานี
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1686627769270916', 'CopperDeer5018', 'teacher', 'secondary', 'อุบลราชธานี', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/1686627769270916', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ศรีสะเกษ', null from t
union all
select id, 'ยโสธร', null from t;

-- 90) Suraibas AppMaths (คณิตศาสตร์) — สพป.สงขลา เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100001406970627', 'Suraibas AppMaths', 'teacher', 'primary', 'สงขลา', 'เขต 1', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100001406970627', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'ปัตตานี' from t;

-- 91) AgileGuava6406 (คณิตศาสตร์) — สพป.นครราชสีมา
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:1598435444945502', 'AgileGuava6406', 'teacher', 'primary', 'นครราชสีมา', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/1598435444945502', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'เชียงใหม่' from t;

-- 92) Khwankamon Phetsuwan (คณิตศาสตร์) — สพป.ระยอง เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100002516874370', 'Khwankamon Phetsuwan', 'teacher', 'primary', 'ระยอง', 'เขต 1', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100002516874370', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ระยอง', 'เขต 2' from t;

-- 93) Nannaphat Norasai (คณิตศาสตร์) — สพป.นครราชสีมา เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100004050137478', 'Nannaphat Norasai', 'teacher', 'primary', 'นครราชสีมา', 'เขต 1', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100004050137478', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ร้อยเอ็ด', 'เขต 2' from t;

-- 94) Suphawan Nuamai (คณิตศาสตร์) — สพป.กำแพงเพชร เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100003991301629', 'Suphawan Nuamai', 'teacher', 'primary', 'กำแพงเพชร', 'เขต 1', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100003991301629', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'กำแพงเพชร' from t;

-- 95) ปภาวดี อุดม (เอกคณิตศาสตร์) — สพม.นนทบุรี
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100050995311127', 'ปภาวดี อุดม', 'teacher', 'secondary', 'นนทบุรี', 'math', 'เอกคณิตศาสตร์', null, 'https://www.facebook.com/100050995311127', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'มหาสารคาม' from t;

-- 96) Double B Sri-Aran (คณิตศาสตร์) — สพป.กรุงเทพมหานคร
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100001868515142', 'Double B Sri-Aran', 'teacher', 'primary', 'กรุงเทพมหานคร', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100001868515142', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'เชียงใหม่', 'เขต 1' from t;

-- 97) Jen Jenjila Khunnasak (คณิตศาสตร์) — สพป.กาฬสินธุ์ เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100010060786324', 'Jen Jenjila Khunnasak', 'teacher', 'primary', 'กาฬสินธุ์', 'เขต 1', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100010060786324', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'สกลนคร', 'เขต 2' from t;

-- 98) Aungkaluk Tawanna (คณิตศาสตร์) — สพป.สุโขทัย เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100002120616717', 'Aungkaluk Tawanna', 'teacher', 'primary', 'สุโขทัย', 'เขต 2', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100002120616717', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ลำปาง', null from t
union all
select id, 'สุโขทัย', 'เขต 1' from t;

-- 99) นริศา คำท้วม (คณิตศาสตร์) — สพป.ชัยภูมิ เขต 1
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100045729972023', 'นริศา คำท้วม', 'teacher', 'primary', 'ชัยภูมิ', 'เขต 1', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100045729972023', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'อุตรดิตถ์', 'เขต 1' from t;

-- 100) Siriwat Arm Lakorn (คณิตศาสตร์) — สพป.ปราจีนบุรี เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100003358149851', 'Siriwat Arm Lakorn', 'teacher', 'primary', 'ปราจีนบุรี', 'เขต 2', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100003358149851', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ยโสธร', null from t
union all
select id, 'มุกดาหาร', null from t
union all
select id, 'อุบลราชธานี', null from t
union all
select id, 'กาฬสินธุ์', null from t
union all
select id, 'ร้อยเอ็ด', null from t;

-- 101) Ran Chi (คณิตศาสตร์) — สพป.นครราชสีมา เขต 4
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100001991064515', 'Ran Chi', 'teacher', 'primary', 'นครราชสีมา', 'เขต 4', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100001991064515', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'เพชรบุรี', null from t
union all
select id, 'ประจวบคีรีขันธ์', null from t
union all
select id, 'มุกดาหาร', null from t
union all
select id, 'สมุทรสาคร', null from t
union all
select id, 'นครปฐม', null from t
union all
select id, 'ปทุมธานี', null from t;

-- 102) Padungsak Ruenthawin (คณิตศาสตร์) — สพป.พระนครศรีอยุธยา เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100001864780496', 'Padungsak Ruenthawin', 'teacher', 'primary', 'พระนครศรีอยุธยา', 'เขต 2', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100001864780496', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'สระบุรี', 'เขต 2' from t;

-- 103) ตามหาแสงสหว่าง แต่ก็ยังหาไม่เจอ (คณิตศาสตร์) — สพม.ราชบุรี
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100008403049478', 'ตามหาแสงสหว่าง แต่ก็ยังหาไม่เจอ', 'teacher', 'secondary', 'ราชบุรี', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100008403049478', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'น่าน' from t;

-- 104) S'Yim Suchai (คณิตศาสตร์) — สพป.สระแก้ว เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100076694385268', 'S''Yim Suchai', 'teacher', 'primary', 'สระแก้ว', 'เขต 2', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100076694385268', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'กาฬสินธุ์' from t;

-- 105) Miw Wararat Prasansak (คณิตศาสตร์) — สพป.ขอนแก่น เขต 3
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100001151008479', 'Miw Wararat Prasansak', 'teacher', 'primary', 'ขอนแก่น', 'เขต 3', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100001151008479', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ชัยภูมิ', 'เขต 1' from t;

-- 106) Benjawan Martkamjan (คณิตศาสตร์) — สพป.กรุงเทพมหานคร
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100001186491820', 'Benjawan Martkamjan', 'teacher', 'primary', 'กรุงเทพมหานคร', 'math', 'คณิตศาสตร์', null, 'https://www.facebook.com/100001186491820', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province, zone)
select id, 'ร้อยเอ็ด', 'เขต 2' from t;

-- 107) กฤษณัช พิทยะปรีชากุล (วิทยาศาสตร์) — สพป.พิจิตร เขต 2
with t as (
  insert into teachers (line_user_id, display_name, position, service_type, origin_province, origin_zone, teaching_group, subject, transfer_round, facebook_url, source, invite_code)
  values ('seed:fb:100010132898064', 'กฤษณัช พิทยะปรีชากุล', 'teacher', 'primary', 'พิจิตร', 'เขต 2', 'science', 'วิทยาศาสตร์', null, 'https://www.facebook.com/100010132898064', 'facebook_import', encode(gen_random_bytes(4), 'hex'))
  returning id
)
insert into destinations (teacher_id, province)
select id, 'แพร่' from t;
