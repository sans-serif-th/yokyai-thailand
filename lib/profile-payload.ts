import { POSITIONS, requiresTeachingGroup } from './positions'
import { SERVICE_TYPES } from './service-types'
import { TEACHING_GROUPS } from './teaching-groups'
import { TRANSFER_ROUND_PATTERN } from './transfer-rounds'
import type { ProfilePayload } from './types'

// Shared by PUT /api/teachers and POST /api/join/[code] — both accept the
// same shape and must apply identical rules, so this lives in one place
// rather than drifting across two copies.

const BENEFIT_NOTE_MAX_LENGTH = 500
const PHONE_PATTERN = /^[0-9+\-\s]{6,20}$/
// LINE IDs are 4-20 characters: letters, digits, '.', '-' and '_' (an official
// account's leading '@' is tolerated).
export const LINE_ID_PATTERN = /^@?[A-Za-z0-9._-]{4,20}$/

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
  if (
    typeof b.transferYear !== 'number' ||
    !Number.isInteger(b.transferYear) ||
    b.transferYear < 2000 ||
    b.transferYear > 2100
  ) {
    return false
  }
  if (b.phone !== null && b.phone !== undefined) {
    if (typeof b.phone !== 'string' || !PHONE_PATTERN.test(b.phone.trim())) return false
  }
  if (b.lineId !== null && b.lineId !== undefined) {
    if (typeof b.lineId !== 'string' || !LINE_ID_PATTERN.test(b.lineId.trim())) return false
  }
  if (!Array.isArray(b.destinations) || b.destinations.length === 0) return false
  return b.destinations.every(
    (d) => d && typeof d === 'object' && typeof (d as { province?: unknown }).province === 'string'
  )
}

// Maps a validated payload onto the `teachers` row's snake_case columns.
// facebook_url is deliberately absent: it is admin-only data (set from the
// backoffice or by the Facebook import), so the app's upsert must never touch it.
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
    transfer_year: payload.transferYear ?? null,
    phone: payload.phone?.trim() || null,
    line_id: payload.lineId?.trim() || null,
  }
}
