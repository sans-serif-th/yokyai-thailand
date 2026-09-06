import { POSITIONS, requiresTeachingGroup } from './positions'
import { SERVICE_TYPES } from './service-types'
import { TEACHING_GROUPS } from './teaching-groups'
import { TRANSFER_ROUND_PATTERN } from './transfer-rounds'
import type { ProfilePayload } from './types'

// Shared by PUT /api/teachers and POST /api/join/[code] — both accept the
// same shape and must apply identical rules, so this lives in one place
// rather than drifting across two copies.

const BENEFIT_NOTE_MAX_LENGTH = 500
const FACEBOOK_URL_MAX_LENGTH = 300

export function validateProfilePayload(body: unknown): body is ProfilePayload {
  if (!body || typeof body !== 'object') return false
  const b = body as Record<string, unknown>
  if (typeof b.displayName !== 'string' || !b.displayName.trim()) return false
  if (typeof b.position !== 'string') return false
  if (!POSITIONS.some((p) => p.code === b.position)) return false
  if (typeof b.serviceType !== 'string') return false
  if (!SERVICE_TYPES.some((s) => s.code === b.serviceType)) return false
  if (typeof b.originProvince !== 'string' || !b.originProvince.trim()) return false
  if (requiresTeachingGroup(b.position)) {
    if (typeof b.teachingGroup !== 'string') return false
    if (!TEACHING_GROUPS.some((g) => g.code === b.teachingGroup)) return false
  } else if (b.teachingGroup !== null && b.teachingGroup !== undefined) {
    return false
  }
  if (b.benefitNote !== null && b.benefitNote !== undefined) {
    if (typeof b.benefitNote !== 'string' || b.benefitNote.length > BENEFIT_NOTE_MAX_LENGTH) {
      return false
    }
  }
  if (typeof b.transferRound !== 'string' || !TRANSFER_ROUND_PATTERN.test(b.transferRound)) {
    return false
  }
  if (b.facebookUrl !== null && b.facebookUrl !== undefined) {
    if (typeof b.facebookUrl !== 'string' || b.facebookUrl.length > FACEBOOK_URL_MAX_LENGTH) {
      return false
    }
  }
  if (!Array.isArray(b.destinations) || b.destinations.length === 0) return false
  return b.destinations.every(
    (d) => d && typeof d === 'object' && typeof (d as { province?: unknown }).province === 'string'
  )
}

// Maps a validated payload onto the `teachers` row's snake_case columns.
export function profilePayloadToTeacherRow(payload: ProfilePayload) {
  const isTeacher = requiresTeachingGroup(payload.position)
  return {
    display_name: payload.displayName,
    position: payload.position,
    service_type: payload.serviceType,
    origin_province: payload.originProvince,
    origin_district: payload.originDistrict ?? null,
    origin_zone: payload.originZone ?? null,
    current_school: payload.currentSchool ?? null,
    teaching_group: isTeacher ? payload.teachingGroup : null,
    subject: isTeacher ? (payload.subject ?? null) : null,
    benefit_note: payload.benefitNote ?? null,
    transfer_round: payload.transferRound ?? null,
    facebook_url: payload.facebookUrl?.trim() || null,
  }
}
