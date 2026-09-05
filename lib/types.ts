import type { TeachingGroupCode } from './teaching-groups'

export interface Destination {
  id: string
  teacher_id: string
  province: string
  district: string | null
}

export interface Teacher {
  id: string
  line_user_id: string
  display_name: string
  origin_province: string
  origin_district: string | null
  current_school: string | null
  teaching_group: TeachingGroupCode
  subject: string | null
  service_start_date: string | null
}

export type MatchTier = 'perfect' | 'high' | 'partial'

export interface ProfilePayload {
  displayName: string
  originProvince: string
  originDistrict: string | null
  currentSchool: string | null
  teachingGroup: string
  subject: string | null
  serviceStartDate: string | null
  destinations: { province: string; district: string | null }[]
}

export interface MatchResult {
  teacher: Teacher
  destinations: Destination[]
  tier: MatchTier
}
