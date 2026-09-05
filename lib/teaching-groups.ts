// The 8 official teaching groups (กลุ่มสาระการเรียนรู้), 2008 Basic Education
// Core Curriculum. Must stay in sync with supabase/schema.sql's seed data.

export type TeachingGroupCode =
  | 'thai'
  | 'math'
  | 'science'
  | 'social'
  | 'health_pe'
  | 'art'
  | 'occupation_tech'
  | 'foreign_lang'

export interface TeachingGroup {
  code: TeachingGroupCode
  nameTh: string
  nameEn: string
}

export const TEACHING_GROUPS: TeachingGroup[] = [
  { code: 'thai', nameTh: 'ภาษาไทย', nameEn: 'Thai Language' },
  { code: 'math', nameTh: 'คณิตศาสตร์', nameEn: 'Mathematics' },
  { code: 'science', nameTh: 'วิทยาศาสตร์', nameEn: 'Science' },
  {
    code: 'social',
    nameTh: 'สังคมศึกษา ศาสนา และวัฒนธรรม',
    nameEn: 'Social Studies, Religion and Culture',
  },
  {
    code: 'health_pe',
    nameTh: 'สุขศึกษาและพลศึกษา',
    nameEn: 'Health and Physical Education',
  },
  { code: 'art', nameTh: 'ศิลปะ', nameEn: 'Art' },
  {
    code: 'occupation_tech',
    nameTh: 'การงานและเทคโนโลยี',
    nameEn: 'Occupations and Technology',
  },
  { code: 'foreign_lang', nameTh: 'ภาษาต่างประเทศ', nameEn: 'Foreign Languages' },
]

export function teachingGroupLabel(code: string): string {
  return TEACHING_GROUPS.find((g) => g.code === code)?.nameTh ?? code
}
