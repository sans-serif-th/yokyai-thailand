import type { PositionCode } from './positions'
import type { ServiceTypeCode } from './service-types'
import type { TeachingGroupCode } from './teaching-groups'

export interface Destination {
  id: string
  teacher_id: string
  province: string
  district: string | null
  zone: string | null
}

export interface Teacher {
  id: string
  line_user_id: string
  display_name: string
  position: PositionCode
  service_type: ServiceTypeCode
  origin_province: string
  origin_district: string | null
  origin_zone: string | null
  current_school: string | null
  teaching_group: TeachingGroupCode | null
  subject: string | null
  benefit_note: string | null
  transfer_round: number | null
  facebook_url: string | null
  source: 'app' | 'facebook_import'
}

export type MatchTier = 'perfect' | 'high' | 'partial'

export interface ProfilePayload {
  displayName: string
  position: string
  serviceType: string
  originProvince: string
  originDistrict: string | null
  originZone: string | null
  currentSchool: string | null
  teachingGroup: string | null
  subject: string | null
  benefitNote: string | null
  transferRound: number | null
  facebookUrl: string | null
  destinations: { province: string; district: string | null; zone: string | null }[]
}

export interface MatchResult {
  teacher: Teacher
  destinations: Destination[]
  tier: MatchTier
  favorited: boolean
}
