import { requiresTeachingGroup } from '../positions'
import { profilePayloadToTeacherRow, validateProfilePayload } from '../profile-payload'
import { findTeacherMatches } from './teacher-matching'
import type { PairRow, RoleImplementation } from './types'

// Same reciprocal-pair definition the admin "Match Coverage" view and the
// platform stats have always used: position, service_type, the exact same
// subject (where the position has one at all — an unspecified subject can't
// count as a match), and each side wanting the other's origin province.
// Rows with no destinations never pair.
function isTeacherMutualPair(a: PairRow, b: PairRow): boolean {
  if (!a.destinations?.length || !b.destinations?.length) return false
  if (a.position !== b.position) return false
  if (a.service_type !== b.service_type) return false
  if (requiresTeachingGroup(a.position) && (!a.subject || a.subject !== b.subject)) return false

  const aWantsBOrigin = a.destinations.some((d) => d.province === b.origin_province)
  const bWantsAOrigin = b.destinations.some((d) => d.province === a.origin_province)
  return aWantsBOrigin && bWantsAOrigin
}

export const teacherRole: RoleImplementation = {
  code: 'teacher',
  validateProfile: validateProfilePayload,
  profileToRow: profilePayloadToTeacherRow,
  findMatches: findTeacherMatches,
  isMutualPair: isTeacherMutualPair,
}
