-- Restore destinations table for existing teachers
-- Source: yokyai.md.rtf (Facebook group comment thread import)
-- 26 teachers matched to existing records; 59 commenters in the source
-- were never imported as teacher records and are out of scope here.

-- Tonsom Samanya
INSERT INTO destinations (teacher_id, province) VALUES ('203abb51-d5b6-41fd-af66-0569351088bf', 'ปทุมธานี') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('203abb51-d5b6-41fd-af66-0569351088bf', 'สุรินทร์') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Piw Lalida
INSERT INTO destinations (teacher_id, province) VALUES ('50ad0e73-796e-4655-b2c7-f7d88949d775', 'ปทุมธานี') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Chanakan Mueanprom
INSERT INTO destinations (teacher_id, province) VALUES ('c6d75a66-46e1-4bd6-aced-9fa64bfcdb59', 'บุรีรัมย์') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Suda Rat (raw: "สพม.กท 2/สพป.ปทุม" — either Bangkok zone 2 or Pathum Thani)
INSERT INTO destinations (teacher_id, province) VALUES ('a563b936-bae5-4411-b59e-3d1a0fd54ae9', 'กรุงเทพมหานคร') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('a563b936-bae5-4411-b59e-3d1a0fd54ae9', 'ปทุมธานี') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Computer2_69
INSERT INTO destinations (teacher_id, province) VALUES ('9c94a078-99bd-4876-9f74-bd8d5079481e', 'ปทุมธานี') ON CONFLICT (teacher_id, province) DO NOTHING;

-- RadiantBee2814
INSERT INTO destinations (teacher_id, province) VALUES ('920051be-3baa-44ad-a838-0da0aea1ece6', 'ปทุมธานี') ON CONFLICT (teacher_id, province) DO NOTHING;

-- UnforgettablePeapod2803
INSERT INTO destinations (teacher_id, province) VALUES ('672db987-616c-47f4-8045-a0e3d94ecf28', 'ปทุมธานี') ON CONFLICT (teacher_id, province) DO NOTHING;

-- KT Keerataya
INSERT INTO destinations (teacher_id, province) VALUES ('f26c1f77-782c-4a6c-b4c4-de27d23be6ed', 'ปทุมธานี') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Karn Nuttapron
INSERT INTO destinations (teacher_id, province) VALUES ('c5469ce5-79e2-47ff-9b7c-b648181f850a', 'พระนครศรีอยุธยา') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Pem Pimporn Surasit
INSERT INTO destinations (teacher_id, province) VALUES ('ab642be0-368a-4249-93e0-24c6c60fe128', 'ปทุมธานี') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Twoone Smooth
INSERT INTO destinations (teacher_id, province) VALUES ('7cccdca8-dd81-4abf-9c56-f95875ef15a6', 'ปทุมธานี') ON CONFLICT (teacher_id, province) DO NOTHING;

-- BraveAvocado7317
INSERT INTO destinations (teacher_id, province) VALUES ('79fc9646-93da-49cb-b0da-cc535cc7a01e', 'สระบุรี') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Maii Zeed
INSERT INTO destinations (teacher_id, province) VALUES ('0a77c321-e462-46af-b351-c8f4e086977d', 'พระนครศรีอยุธยา') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Chayanee Sungchaiyapoom
INSERT INTO destinations (teacher_id, province) VALUES ('e798611b-527d-41f5-ae47-c3f077b11a0f', 'ปทุมธานี') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Nuengruetai Chinthanam
INSERT INTO destinations (teacher_id, province) VALUES ('6b982763-10a4-4155-9f1f-657bb1884591', 'ปทุมธานี') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Ump Amethyst
INSERT INTO destinations (teacher_id, province) VALUES ('1919b7fc-123d-423f-b0c1-dc06069c953e', 'ปทุมธานี') ON CONFLICT (teacher_id, province) DO NOTHING;

-- ResilientCrocodile6179
INSERT INTO destinations (teacher_id, province) VALUES ('2186ee6c-07ab-4a93-b5cc-1302e2e2fa56', 'พระนครศรีอยุธยา') ON CONFLICT (teacher_id, province) DO NOTHING;

-- SageSunflower8406
INSERT INTO destinations (teacher_id, province) VALUES ('c6fdf556-ed3b-46b1-9f00-d591e3e97797', 'ปทุมธานี') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Kun Kunsuda
INSERT INTO destinations (teacher_id, province) VALUES ('88922ff1-c587-4923-b1c0-b6f7ded5aa0f', 'ปทุมธานี') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Non Patithan
INSERT INTO destinations (teacher_id, province) VALUES ('8d231333-b1b4-4e63-95ca-8da99891c825', 'ปทุมธานี') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Eye Aunchisa
INSERT INTO destinations (teacher_id, province) VALUES ('b6a4f2e8-2be2-443d-8ed1-d8d10046d68b', 'ปทุมธานี') ON CONFLICT (teacher_id, province) DO NOTHING;

-- CuteDragon294
INSERT INTO destinations (teacher_id, province) VALUES ('0eb0ef6d-882c-4340-84d5-4eb77ac3a9da', 'อุดรธานี') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Benchaporn Tutong
INSERT INTO destinations (teacher_id, province) VALUES ('4fa399e9-6802-4d4d-827c-764ad9035b4e', 'แพร่') ON CONFLICT (teacher_id, province) DO NOTHING;

-- GiftedOtter9641
INSERT INTO destinations (teacher_id, province) VALUES ('a68223c9-4cac-4005-9eb7-f4afb0ed5c8c', 'สกลนคร') ON CONFLICT (teacher_id, province) DO NOTHING;

-- JoyfulDachshund4047
INSERT INTO destinations (teacher_id, province) VALUES ('46790ced-624b-4538-bdcf-d9ee43cf77c4', 'สระบุรี') ON CONFLICT (teacher_id, province) DO NOTHING;

-- RubyCorgi8943
INSERT INTO destinations (teacher_id, province) VALUES ('bf852193-5e9f-42bf-be41-8780e55af04d', 'ราชบุรี') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Batch 2: matched by Facebook numeric ID (more reliable than name matching)
-- Source: live re-scrape of post #1 (facebook.com/share/p/1MNW6wF1Na)

-- Adisorn Nilrasamee (fb:100004269127048) — origin กาญจนบุรี → นครปฐม
INSERT INTO destinations (teacher_id, province) VALUES ('2a5ef604-8c39-4a42-b608-a8fec8f544e0', 'นครปฐม') ON CONFLICT (teacher_id, province) DO NOTHING;

-- ExcitingPenguin2256 (fb:1723904375601225) — origin ยะลา → ปัตตานี
INSERT INTO destinations (teacher_id, province) VALUES ('d56b2836-b740-406b-b575-cc97c5c5313e', 'ปัตตานี') ON CONFLICT (teacher_id, province) DO NOTHING;

-- UnforgettableRadish8592 (fb:4584973121827160) — origin บึงกาฬ → นครพนม
INSERT INTO destinations (teacher_id, province) VALUES ('baab7e83-b31a-4064-8770-7d036e95e7a3', 'นครพนม') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Batch 3: matched by Facebook numeric ID from Google Doc paste
-- Source: user-collected comment threads across multiple posts in the group

-- English_5212 (fb:2116478152592240) — origin สุพรรณบุรี
INSERT INTO destinations (teacher_id, province) VALUES ('4f193419-d0fd-47a6-8775-a4b4411e5d4e', 'สุพรรณบุรี') ON CONFLICT (teacher_id, province) DO NOTHING;

-- AttractiveChipmunk88888 (fb:957239504002183) — origin เพชรบูรณ์
INSERT INTO destinations (teacher_id, province) VALUES ('0d49f6a9-6ad4-4afc-a26c-08e82afa602f', 'เพชรบูรณ์') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('0d49f6a9-6ad4-4afc-a26c-08e82afa602f', 'ปทุมธานี') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('0d49f6a9-6ad4-4afc-a26c-08e82afa602f', 'นนทบุรี') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('0d49f6a9-6ad4-4afc-a26c-08e82afa602f', 'สระบุรี') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('0d49f6a9-6ad4-4afc-a26c-08e82afa602f', 'พระนครศรีอยุธยา') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('0d49f6a9-6ad4-4afc-a26c-08e82afa602f', 'ลพบุรี') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('0d49f6a9-6ad4-4afc-a26c-08e82afa602f', 'กรุงเทพมหานคร') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Petchdarat Thongthai (fb:1827555470) — origin กำแพงเพชร
INSERT INTO destinations (teacher_id, province) VALUES ('234c7611-20f3-471b-b393-1938773f3bb0', 'อ่างทอง') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('234c7611-20f3-471b-b393-1938773f3bb0', 'พระนครศรีอยุธยา') ON CONFLICT (teacher_id, province) DO NOTHING;

-- ครูผู้น้อยคอยรัก (fb:1564743742061192) — origin สระแก้ว
INSERT INTO destinations (teacher_id, province) VALUES ('6414488b-783c-455e-b4ed-9868585eea84', 'สุรินทร์') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Beeee7980 (fb:1344871330361414) — origin ประจวบคีรีขันธ์
INSERT INTO destinations (teacher_id, province) VALUES ('d3c18929-e0e5-4c4a-8097-a1da60eac747', 'สุราษฎร์ธานี') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('d3c18929-e0e5-4c4a-8097-a1da60eac747', 'ชุมพร') ON CONFLICT (teacher_id, province) DO NOTHING;

-- SincereCranberry5065 (fb:1338426787823871) — origin อุบลราชธานี
INSERT INTO destinations (teacher_id, province) VALUES ('b38b59c0-4965-4c7a-a303-a6f970080088', 'อุบลราชธานี') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('b38b59c0-4965-4c7a-a303-a6f970080088', 'ศรีสะเกษ') ON CONFLICT (teacher_id, province) DO NOTHING;

-- BeautifulNarwhal8137 (fb:1047146631333162) — origin จันทบุรี
INSERT INTO destinations (teacher_id, province) VALUES ('6f72fbd4-fad5-4266-ae03-816343d901e4', 'สระแก้ว') ON CONFLICT (teacher_id, province) DO NOTHING;

-- BronzeBlueberry9605 (fb:1567331115045810) — origin นครศรีธรรมราช
INSERT INTO destinations (teacher_id, province) VALUES ('614191e7-404f-4d3d-acc3-464e9770e3cf', 'กรุงเทพมหานคร') ON CONFLICT (teacher_id, province) DO NOTHING;

-- OrangeAsparagus4503 (fb:1839164664075123) — origin กรุงเทพมหานคร
INSERT INTO destinations (teacher_id, province) VALUES ('16747448-0102-42c8-83e3-facd21dc0ddb', 'พิษณุโลก') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('16747448-0102-42c8-83e3-facd21dc0ddb', 'อุตรดิตถ์') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Intelligent4909 (fb:1337444414826245) — origin กาฬสินธุ์
INSERT INTO destinations (teacher_id, province) VALUES ('1e55aa59-cda7-418e-baf5-872e0d9cfbc8', 'ขอนแก่น') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Puipuy Janjira (fb:100002356390893) — origin ขอนแก่น
INSERT INTO destinations (teacher_id, province) VALUES ('5033c562-eba7-41e7-9789-b2ffe5d00e00', 'หนองคาย') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Tuinui Mayuree (fb:100000737876576) — origin นครราชสีมา
INSERT INTO destinations (teacher_id, province) VALUES ('5dada547-4af8-4dfc-9d79-5ed2bd0eb3a8', 'บุรีรัมย์') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('5dada547-4af8-4dfc-9d79-5ed2bd0eb3a8', 'นครราชสีมา') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Suwachira Suwanwiang (fb:100006527626185) — origin นครพนม
INSERT INTO destinations (teacher_id, province) VALUES ('b43b4c97-87d4-464e-9f41-1ab0bcd233e9', 'ร้อยเอ็ด') ON CONFLICT (teacher_id, province) DO NOTHING;

-- YellowFlower1790 (fb:1219759713641120) — origin อุบลราชธานี
INSERT INTO destinations (teacher_id, province) VALUES ('086fd878-c39c-49fc-bd2c-08f75f27ccb6', 'ศรีสะเกษ') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('086fd878-c39c-49fc-bd2c-08f75f27ccb6', 'สุรินทร์') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Genz_art5578 (fb:1047628557981411) — origin หนองคาย
INSERT INTO destinations (teacher_id, province) VALUES ('f1c89b08-331f-4ec7-bb90-29f304e61214', 'หนองบัวลำภู') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('f1c89b08-331f-4ec7-bb90-29f304e61214', 'เลย') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Nipon Duangmeun (fb:100007209040659) — origin ชุมพร
INSERT INTO destinations (teacher_id, province) VALUES ('9500a128-77dc-446c-ac40-483bdbf2f2d7', 'สงขลา') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('9500a128-77dc-446c-ac40-483bdbf2f2d7', 'สตูล') ON CONFLICT (teacher_id, province) DO NOTHING;

-- เอ๋ สิทธิพงษ์ (fb:100002452284112) — origin ชลบุรี
INSERT INTO destinations (teacher_id, province) VALUES ('a9e04324-0157-4312-94af-3329f5ba5787', 'บึงกาฬ') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('a9e04324-0157-4312-94af-3329f5ba5787', 'สกลนคร') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Jutamat Hiamharn (fb:100015108738900) — origin ราชบุรี
INSERT INTO destinations (teacher_id, province) VALUES ('dd1e35b6-773c-493b-af1d-dee1622fb5d3', 'เพชรบุรี') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Mangkartoon (fb:100002594888073) — origin พิษณุโลก
INSERT INTO destinations (teacher_id, province) VALUES ('d985ae62-64c3-4e4a-9de4-bbe5ff811848', 'อุตรดิตถ์') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('d985ae62-64c3-4e4a-9de4-bbe5ff811848', 'แพร่') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Muk Rakchanok (fb:100002975919708) — origin สุราษฎร์ธานี
INSERT INTO destinations (teacher_id, province) VALUES ('11495f2e-9fda-42fd-91d9-e8307a345cb1', 'นครศรีธรรมราช') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Thidarat Rattananon (fb:100002039587484) — origin พิษณุโลก
INSERT INTO destinations (teacher_id, province) VALUES ('f3c109dd-590b-4437-9ccc-6ffe3366c780', 'เชียงใหม่') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Wittaya Kanpromkad (fb:100001268893623) — origin ลำพูน
INSERT INTO destinations (teacher_id, province) VALUES ('a2b7b769-94d2-4ca3-bb1c-7e7c9e82a66b', 'ลำพูน') ON CONFLICT (teacher_id, province) DO NOTHING;

-- LoveSmartSmile (fb:1377752200773771) — origin เชียงใหม่
INSERT INTO destinations (teacher_id, province) VALUES ('574c6202-4c77-48cd-93d7-ed11ac2d01a7', 'ลำปาง') ON CONFLICT (teacher_id, province) DO NOTHING;

-- So Soparat (fb:100001681197208) — origin สุราษฎร์ธานี
INSERT INTO destinations (teacher_id, province) VALUES ('780f6dd7-4d96-40c0-a54e-db5cf14caf11', 'นครศรีธรรมราช') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Waraphörn Dondee (fb:100012558674741) — origin พิษณุโลก
INSERT INTO destinations (teacher_id, province) VALUES ('13f9496b-826b-4bc3-a6bc-a9d8f4fd6321', 'พิษณุโลก') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('13f9496b-826b-4bc3-a6bc-a9d8f4fd6321', 'สุโขทัย') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Batch 4: destination encoded directly in the display_name (no FB lookup needed)
-- "ครูสังคมปทุมธานี อยากไปกทม" = "Social studies teacher, Pathum Thani, wants to go to Bangkok"
INSERT INTO destinations (teacher_id, province) VALUES ('01a097a2-013f-4980-91d5-299f6610ff43', 'กรุงเทพมหานคร') ON CONFLICT (teacher_id, province) DO NOTHING;

-- "ครูคอมชลบุรี ย้ายไปกทม" = "Computer teacher, Chonburi, moving to Bangkok"
INSERT INTO destinations (teacher_id, province) VALUES ('8c51c683-02fb-4b71-82a9-441e0535b483', 'กรุงเทพมหานคร') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Batch 5: matched by Facebook numeric ID from expanded Google Doc paste (round 2)

-- Mintra Puntumas (fb:100050738314489) — origin ปทุมธานี
INSERT INTO destinations (teacher_id, province) VALUES ('2a9bf869-2368-4f56-bc60-dbe1cc9c2c3b', 'ชลบุรี') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Jirawaranit Sinla (fb:100002182512816) — origin กาญจนบุรี
INSERT INTO destinations (teacher_id, province) VALUES ('5799700a-8a77-4696-9d40-602c2f8e3491', 'อุทัยธานี') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('5799700a-8a77-4696-9d40-602c2f8e3491', 'ชัยนาท') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Pornpawee Lowjow (fb:100000702628326) — origin สมุทรสาคร
INSERT INTO destinations (teacher_id, province) VALUES ('4d37b0af-0f40-4246-87c9-f8dcd3b67887', 'สมุทรสงคราม') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('4d37b0af-0f40-4246-87c9-f8dcd3b67887', 'บุรีรัมย์') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('4d37b0af-0f40-4246-87c9-f8dcd3b67887', 'สมุทรสาคร') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('4d37b0af-0f40-4246-87c9-f8dcd3b67887', 'สุรินทร์') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('4d37b0af-0f40-4246-87c9-f8dcd3b67887', 'กรุงเทพมหานคร') ON CONFLICT (teacher_id, province) DO NOTHING;

-- GrayMoose7219 (fb:1594679658735393) — origin นครพนม
INSERT INTO destinations (teacher_id, province) VALUES ('eeee4f1b-2aca-4f6e-aed1-fb9050c234a6', 'อุดรธานี') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('eeee4f1b-2aca-4f6e-aed1-fb9050c234a6', 'บึงกาฬ') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('eeee4f1b-2aca-4f6e-aed1-fb9050c234a6', 'สกลนคร') ON CONFLICT (teacher_id, province) DO NOTHING;

-- PastelParsnip3492 (fb:1489635525567001) — origin ปทุมธานี
INSERT INTO destinations (teacher_id, province) VALUES ('385fb94a-aa5d-48e3-a5f7-98545242acfe', 'บุรีรัมย์') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('385fb94a-aa5d-48e3-a5f7-98545242acfe', 'หนองคาย') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('385fb94a-aa5d-48e3-a5f7-98545242acfe', 'นครราชสีมา') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('385fb94a-aa5d-48e3-a5f7-98545242acfe', 'อุดรธานี') ON CONFLICT (teacher_id, province) DO NOTHING;

-- CopperSquirrel9308 (fb:1650712182669566) — origin ปทุมธานี
INSERT INTO destinations (teacher_id, province) VALUES ('2fa02dbd-ebda-4ad8-9589-f8a013fe2fdc', 'นครศรีธรรมราช') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('2fa02dbd-ebda-4ad8-9589-f8a013fe2fdc', 'พัทลุง') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('2fa02dbd-ebda-4ad8-9589-f8a013fe2fdc', 'สงขลา') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('2fa02dbd-ebda-4ad8-9589-f8a013fe2fdc', 'ตรัง') ON CONFLICT (teacher_id, province) DO NOTHING;

-- FaNg IntuOn (fb:100001510396554) — origin กาญจนบุรี
INSERT INTO destinations (teacher_id, province) VALUES ('2e42f44c-66e0-4104-9453-a499d8a0d9f6', 'พระนครศรีอยุธยา') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('2e42f44c-66e0-4104-9453-a499d8a0d9f6', 'สมุทรปราการ') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('2e42f44c-66e0-4104-9453-a499d8a0d9f6', 'สมุทรสาคร') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('2e42f44c-66e0-4104-9453-a499d8a0d9f6', 'กรุงเทพมหานคร') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('2e42f44c-66e0-4104-9453-a499d8a0d9f6', 'นนทบุรี') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('2e42f44c-66e0-4104-9453-a499d8a0d9f6', 'ราชบุรี') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('2e42f44c-66e0-4104-9453-a499d8a0d9f6', 'นครปฐม') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('2e42f44c-66e0-4104-9453-a499d8a0d9f6', 'ปทุมธานี') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Preyanud Muacksang (fb:100001163980766) — origin ปทุมธานี
INSERT INTO destinations (teacher_id, province) VALUES ('eebff1fc-90bb-4f28-8b40-a843cd47c701', 'ปทุมธานี') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Grace Napassorn Oaksornsom (fb:100007621650886) — origin พังงา
INSERT INTO destinations (teacher_id, province) VALUES ('af329caa-4c01-485e-ab86-87c1ac1d2da3', 'ปทุมธานี') ON CONFLICT (teacher_id, province) DO NOTHING;

-- โบอา (fb:100006779254186) — origin สิงห์บุรี
INSERT INTO destinations (teacher_id, province) VALUES ('dbf7dc15-026b-4655-9037-162b2b8114e3', 'ปทุมธานี') ON CONFLICT (teacher_id, province) DO NOTHING;

-- MagicalDeer7169 (fb:1313339397010638) — origin อ่างทอง
INSERT INTO destinations (teacher_id, province) VALUES ('34ff1c93-7837-4ff9-a9a9-bbd2bb71fab7', 'ปทุมธานี') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Miaw Sisai (fb:100002556668614) — origin ปทุมธานี
INSERT INTO destinations (teacher_id, province) VALUES ('2fe3e263-5b12-47d4-8606-ff713b122f19', 'พระนครศรีอยุธยา') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Khru Puy Wiparat (fb:100008412332006) — origin ปทุมธานี
INSERT INTO destinations (teacher_id, province) VALUES ('4512538b-775e-4b33-bb4c-9913521ed162', 'สระบุรี') ON CONFLICT (teacher_id, province) DO NOTHING;

-- CapableRadish9137 (fb:1937547036948617) — origin สมุทรปราการ
INSERT INTO destinations (teacher_id, province) VALUES ('f814db97-4d6c-4e75-95f0-98e1a6007771', 'ปทุมธานี') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Pflower500 (fb:1029315883098020) — origin ปทุมธานี
INSERT INTO destinations (teacher_id, province) VALUES ('df2d2632-ed4c-4656-9999-95c25605d6d1', 'นนทบุรี') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('df2d2632-ed4c-4656-9999-95c25605d6d1', 'กรุงเทพมหานคร') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Namtip Wannakan (fb:100001601313217) — origin ปทุมธานี
INSERT INTO destinations (teacher_id, province) VALUES ('44940624-7797-4a4b-b2fa-ba680ad37ec7', 'ปราจีนบุรี') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('44940624-7797-4a4b-b2fa-ba680ad37ec7', 'นครนายก') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Krit Pawanan (fb:100001898983265) — origin ปทุมธานี
INSERT INTO destinations (teacher_id, province) VALUES ('e001639c-cf28-471a-92d0-3e6da6177027', 'นครสวรรค์') ON CONFLICT (teacher_id, province) DO NOTHING;

-- หรเขตร์ นนทสรณ์ (fb:100002555709806) — origin ปทุมธานี
INSERT INTO destinations (teacher_id, province) VALUES ('9d6d14e4-2c5a-4961-84bf-56b99bdda852', 'ร้อยเอ็ด') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Pat Mayara (fb:100004995696259) — origin ปทุมธานี
INSERT INTO destinations (teacher_id, province) VALUES ('b834e617-74a6-4f3a-b1f9-d56e69e999a4', 'เชียงใหม่') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('b834e617-74a6-4f3a-b1f9-d56e69e999a4', 'เชียงราย') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('b834e617-74a6-4f3a-b1f9-d56e69e999a4', 'พิษณุโลก') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('b834e617-74a6-4f3a-b1f9-d56e69e999a4', 'สุโขทัย') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('b834e617-74a6-4f3a-b1f9-d56e69e999a4', 'พะเยา') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('b834e617-74a6-4f3a-b1f9-d56e69e999a4', 'ลำปาง') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('b834e617-74a6-4f3a-b1f9-d56e69e999a4', 'ลำพูน') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('b834e617-74a6-4f3a-b1f9-d56e69e999a4', 'น่าน') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('b834e617-74a6-4f3a-b1f9-d56e69e999a4', 'แพร่') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Monlagan Matman (fb:100014445184103) — origin ปทุมธานี
INSERT INTO destinations (teacher_id, province) VALUES ('f87b17dc-570b-4bae-9a6f-69b50769dae6', 'เชียงราย') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('f87b17dc-570b-4bae-9a6f-69b50769dae6', 'พะเยา') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('f87b17dc-570b-4bae-9a6f-69b50769dae6', 'ลำปาง') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('f87b17dc-570b-4bae-9a6f-69b50769dae6', 'ลำพูน') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('f87b17dc-570b-4bae-9a6f-69b50769dae6', 'น่าน') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('f87b17dc-570b-4bae-9a6f-69b50769dae6', 'แพร่') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Ohm Sikaret Khumchai (fb:100001277359648) — origin ปทุมธานี
INSERT INTO destinations (teacher_id, province) VALUES ('e59d8c0e-eba5-4b33-ad25-f0073e47c3dd', 'นครราชสีมา') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Ice'e Malinee (fb:100003890747135) — origin ปทุมธานี
INSERT INTO destinations (teacher_id, province) VALUES ('292deb8d-4fbd-4701-9f23-75b6ce279c65', 'ระยอง') ON CONFLICT (teacher_id, province) DO NOTHING;
INSERT INTO destinations (teacher_id, province) VALUES ('292deb8d-4fbd-4701-9f23-75b6ce279c65', 'ชลบุรี') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Waratchaya Chawalit (fb:100000099917050) — origin ปทุมธานี
INSERT INTO destinations (teacher_id, province) VALUES ('c5b6f1d9-89c9-46c3-b38f-5b2b47965f57', 'อ่างทอง') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Pattraporn Sangdang (fb:100000074941183) — origin ปทุมธานี
INSERT INTO destinations (teacher_id, province) VALUES ('95e25fec-01d4-43b7-9992-ccce193b7500', 'ปทุมธานี') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Aum Iris (fb:100070390312655) — origin ปทุมธานี
INSERT INTO destinations (teacher_id, province) VALUES ('76145dda-23e6-41af-a90f-7dec46083b21', 'นครนายก') ON CONFLICT (teacher_id, province) DO NOTHING;

-- StunningCapybara6676 (fb:997281623100384) — origin ชัยภูมิ
INSERT INTO destinations (teacher_id, province) VALUES ('de627ce9-764f-4af1-973c-c079aeaff1bb', 'ปทุมธานี') ON CONFLICT (teacher_id, province) DO NOTHING;

-- Batch 6: Aon Wasan recovered from original RTF via fb_id match (name-only matching missed it)
INSERT INTO destinations (teacher_id, province) VALUES ('3f80b536-a275-4dc5-b558-0f53cc81c832', 'สุรินทร์') ON CONFLICT (teacher_id, province) DO NOTHING;
-- Peter SU (fb:100030425361369) — origin ยะลา → ภูเก็ต
INSERT INTO destinations (teacher_id, province) VALUES ('6990a8a5-8be0-48fe-9390-88366edeaf66', 'ภูเก็ต') ON CONFLICT (teacher_id, province) DO NOTHING;
