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
  phone: string | null
  line_id: string | null
  source: 'app' | 'facebook_import'
  invite_code: string | null
  claimed_at: string | null
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
  phone?: string | null
  lineId?: string | null
  destinations: { province: string; district: string | null; zone: string | null }[]
}

export type ContactStatus = 'pending' | 'accepted' | 'declined' | 'cancelled'

// A requester may send a contact request to the same person at most this many
// times (cancel + resend counts each send).
export const MAX_CONTACT_SENDS = 3

// Which way a contact request points relative to the viewer.
export type ContactDirection = 'incoming' | 'outgoing'

// Attached to a match card when a request exists between the two teachers.
export interface MatchContact {
  requestId: string
  status: ContactStatus
  direction: ContactDirection
  // Sends the viewer has left for this person (outgoing requests only).
  sendsLeft: number
}

export interface MatchResult {
  teacher: Teacher
  destinations: Destination[]
  tier: MatchTier
  favorited: boolean
  contact?: MatchContact | null
}

// One row of /contacts. `name`/`lineId`/`phone` are only filled once the
// request is accepted — see toContactView in lib/contacts.ts.
export interface ContactRequestView {
  id: string
  status: ContactStatus
  direction: ContactDirection
  sendsLeft: number
  createdAt: string
  teacherId: string
  summary: { position: string; teachingGroup: string | null; originProvince: string }
  maskedName: string
  name: string | null
  lineId: string | null
  phone: string | null
}

export interface Round {
  id: string
  label: string
  is_active: boolean
  matching_opens_at: string | null
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

// Per-value counts (province/subject), sorted descending, for the
// registration-period dashboard shown in place of match results before a
// round reaches its matching phase (see components/registration-breakdown.tsx).
export interface RegistrationBreakdown {
  totalRegistered: number
  byOriginProvince: { province: string; count: number }[]
  byDestinationProvince: { province: string; count: number }[]
  bySubject: { subject: string; count: number }[]
}
