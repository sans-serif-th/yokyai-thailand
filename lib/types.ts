import type { PositionCode } from './positions'
import type { ServiceTypeCode } from './service-types'
import type { TeachingGroupCode } from './teaching-groups'

// Internal admin-only outreach tracking (Match Coverage dropdown) — never
// shown to end users.
export type AdminStatus = 'new' | 'contacted' | 'follow_up' | 'closed'

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
  transfer_round: string | null
  transfer_year: number | null
  facebook_url: string | null
  source: 'app' | 'facebook_import'
  invite_code: string | null
  claimed_at: string | null
  queue_released_at: string | null
  category: string
  admin_status: AdminStatus
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
  transferRound: string | null
  transferYear: number | null
  facebookUrl: string | null
  destinations: { province: string; district: string | null; zone: string | null }[]
}

export interface MatchResult {
  teacher: Teacher
  destinations: Destination[]
  tier: MatchTier
  favorited: boolean
}

export interface Round {
  id: string
  label: string
  is_active: boolean
}

export type PackageCode = 'free' | 'paid'

export interface SubscriptionStatus {
  round: Round | null
  package: PackageCode
  verified: boolean
  maxDestinations: number
  slipUploaded: boolean
}

// Aggregate, non-personal counts for the platform-wide summary shown above
// the search results (see components/stats-dashboard.tsx) — never includes
// individual teacher records.
export interface PlatformStats {
  totalRegistered: number
  originProvinceCount: number
  destinationProvinceCount: number
  matchCount: number
  subjectCount: number
}

// Batched-rollout queue status for the calling user (see lib/queue.ts).
// position/totalWaiting are only meaningful when released is false.
export interface QueueStatus {
  released: boolean
  position: number | null
  totalWaiting: number | null
}
