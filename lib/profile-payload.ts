import { BENEFIT_NOTE_MAX_LENGTH, LINE_ID_PATTERN, PHONE_PATTERN } from './field-constants'
import { requiresTeachingGroup } from './positions'
import { fieldsToRow, validateFields } from './roles/fields'
import { TEACHER_FIELDS } from './roles/teacher-fields'
import type { ProfilePayload } from './types'

// Shared by PUT /api/teachers and POST /api/join/[code] — both accept the
// same shape and must apply identical rules, so this lives in one place
// rather than drifting across two copies.

export { BENEFIT_NOTE_MAX_LENGTH, LINE_ID_PATTERN, PHONE_PATTERN }

export interface ContactPatch {
  displayName: string
  phone: string | null
  lineId: string | null
}

// Body of PATCH /api/teachers/contact: the only fields a user edits on the
// profile-edit screen. Kept separate from the full-profile PUT so that screen
// never has to re-send (and risk wiping) the rest of the profile.
export function validateContactPatch(body: unknown): body is ContactPatch {
  if (!body || typeof body !== 'object') return false
  const b = body as Record<string, unknown>
  if (typeof b.displayName !== 'string' || !b.displayName.trim()) return false
  if (b.phone !== null && b.phone !== undefined) {
    if (typeof b.phone !== 'string' || (b.phone.trim() && !PHONE_PATTERN.test(b.phone.trim()))) return false
  }
  if (b.lineId !== null && b.lineId !== undefined) {
    if (typeof b.lineId !== 'string' || (b.lineId.trim() && !LINE_ID_PATTERN.test(b.lineId.trim()))) return false
  }
  return true
}

export function contactPatchToRow(patch: ContactPatch) {
  return {
    display_name: patch.displayName.trim(),
    phone: patch.phone?.trim() || null,
    line_id: patch.lineId?.trim() || null,
  }
}

export function validateProfilePayload(body: unknown): body is ProfilePayload {
  if (!body || typeof body !== 'object') return false
  const b = body as Record<string, unknown>
  if (!validateFields(TEACHER_FIELDS, b)) return false
  const position = b.position as string
  if (requiresTeachingGroup(position)) {
    if (typeof b.teachingGroup !== 'string') return false
  } else if (b.teachingGroup !== null && b.teachingGroup !== undefined) {
    return false
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
  const row = fieldsToRow(TEACHER_FIELDS, payload as unknown as Record<string, unknown>)
  // Teaching group / subject exist only for teaching staff.
  if (!requiresTeachingGroup(payload.position)) {
    row.teaching_group = null
    row.subject = null
  }
  return row
}
