-- Normalize teachers.subject free text into canonical names per teaching_group,
-- and seed the subjects master table (requires migration 0014 already applied).
-- 'เอก' is just the common prefix for 'วิชาเอก' (teaching major) -- values with
-- and without it in the same teaching_group refer to the same subject. Distinct
-- specializations (เอกเคมี, ชีววิทยา, เอกนาฏศิลป์) are kept separate, not merged
-- into the generic bucket for their teaching_group.

-- 1. Normalize existing free-text subject values
UPDATE teachers SET subject = 'เอกคณิตศาสตร์' WHERE teaching_group = 'math' AND subject = 'คณิตศาสตร์';
UPDATE teachers SET subject = 'เอกวิทยาศาสตร์' WHERE teaching_group = 'science' AND subject = 'วิทยาศาสตร์';
UPDATE teachers SET subject = 'เอกวิทยาศาสตร์' WHERE teaching_group = 'science' AND subject = 'เอกวิทย์';
UPDATE teachers SET subject = 'เอกวิทยาศาสตร์' WHERE teaching_group = 'science' AND subject = 'วิทย์';
UPDATE teachers SET subject = 'เอกชีววิทยา' WHERE teaching_group = 'science' AND subject = 'ชีววิทยา';
UPDATE teachers SET subject = 'เอกภาษาไทย' WHERE teaching_group = 'thai' AND subject = 'ภาษาไทย';
UPDATE teachers SET subject = 'เอกภาษาไทย' WHERE teaching_group = 'thai' AND subject = 'เอกไทย';
UPDATE teachers SET subject = 'เอกสังคมศึกษา' WHERE teaching_group = 'social' AND subject = 'สังคมศึกษา';
UPDATE teachers SET subject = 'เอกสังคมศึกษา' WHERE teaching_group = 'social' AND subject = 'สังคม';
UPDATE teachers SET subject = 'เอกสังคมศึกษา' WHERE teaching_group = 'social' AND subject = 'เอกสังคม';
UPDATE teachers SET subject = 'เอกภาษาอังกฤษ' WHERE teaching_group = 'foreign_lang' AND subject = 'เอกอังกฤษ';
UPDATE teachers SET subject = 'เอกภาษาอังกฤษ' WHERE teaching_group = 'foreign_lang' AND subject = 'ภาษาอังกฤษ';
UPDATE teachers SET subject = 'เอกคอมพิวเตอร์' WHERE teaching_group = 'occupation_tech' AND subject = 'คอมพิวเตอร์';
UPDATE teachers SET subject = 'เอกคอมพิวเตอร์' WHERE teaching_group = 'occupation_tech' AND subject = 'เอกคอม';
UPDATE teachers SET subject = 'เอกดนตรี' WHERE teaching_group = 'art' AND subject = 'เอกดนตรีสากล';
UPDATE teachers SET subject = 'เอกดนตรี' WHERE teaching_group = 'art' AND subject = 'เอกดนตรี/ดนตรีศึกษา';
UPDATE teachers SET subject = 'เอกพลศึกษา' WHERE teaching_group = 'health_pe' AND subject = 'พลศึกษา';

-- 2. Seed the subjects master table with the canonical values now in use
INSERT INTO subjects (teaching_group, name_th) VALUES ('math', 'เอกคณิตศาสตร์') ON CONFLICT (teaching_group, name_th) DO NOTHING;
INSERT INTO subjects (teaching_group, name_th) VALUES ('science', 'เอกวิทยาศาสตร์') ON CONFLICT (teaching_group, name_th) DO NOTHING;
INSERT INTO subjects (teaching_group, name_th) VALUES ('science', 'เอกเคมี') ON CONFLICT (teaching_group, name_th) DO NOTHING;
INSERT INTO subjects (teaching_group, name_th) VALUES ('science', 'เอกชีววิทยา') ON CONFLICT (teaching_group, name_th) DO NOTHING;
INSERT INTO subjects (teaching_group, name_th) VALUES ('thai', 'เอกภาษาไทย') ON CONFLICT (teaching_group, name_th) DO NOTHING;
INSERT INTO subjects (teaching_group, name_th) VALUES ('social', 'เอกสังคมศึกษา') ON CONFLICT (teaching_group, name_th) DO NOTHING;
INSERT INTO subjects (teaching_group, name_th) VALUES ('foreign_lang', 'เอกภาษาอังกฤษ') ON CONFLICT (teaching_group, name_th) DO NOTHING;
INSERT INTO subjects (teaching_group, name_th) VALUES ('occupation_tech', 'เอกคอมพิวเตอร์') ON CONFLICT (teaching_group, name_th) DO NOTHING;
INSERT INTO subjects (teaching_group, name_th) VALUES ('art', 'เอกดนตรี') ON CONFLICT (teaching_group, name_th) DO NOTHING;
INSERT INTO subjects (teaching_group, name_th) VALUES ('art', 'เอกนาฏศิลป์') ON CONFLICT (teaching_group, name_th) DO NOTHING;
INSERT INTO subjects (teaching_group, name_th) VALUES ('health_pe', 'เอกพลศึกษา') ON CONFLICT (teaching_group, name_th) DO NOTHING;