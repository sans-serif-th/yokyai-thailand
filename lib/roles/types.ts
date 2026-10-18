import type { FieldDef } from './fields'
import type { MatchResult, ProfilePayload, Teacher, Destination } from '../types'

// The slice of a teachers row (+ destinations) that mutual-pair counting
// needs — shared by stats and the admin coverage views.
export type PairRow = Pick<Teacher, 'position' | 'service_type' | 'subject' | 'origin_province'> & {
  category?: string | null
  destinations?: Destination[]
  // Role-specific fields (extension table), when the query selected them.
  profile?: Record<string, unknown> | null
}

// Everything that differs per role (ประเภทผู้ใช้): what a registration looks
// like, how it maps onto a row, who matches whom. The admin page
// (/admin/roles) only manages a role's metadata (name, status, order); a role
// can be switched on there only once an implementation is registered here —
// see lib/roles/index.ts and docs/adding-a-role.md.
export interface RoleImplementation {
  code: string
  // Registration fields; drive validation, the admin edit whitelist and which
  // columns other users may see (lib/roles/fields.ts).
  fields: readonly FieldDef[]
  // Table (keyed by teacher_id) holding the fields whose FieldDef.table matches.
  // Omitted for roles that fit entirely on `teachers`.
  extensionTable?: string
  validateProfile(body: unknown): body is ProfilePayload
  profileToRow(payload: ProfilePayload): Record<string, unknown>
  // The requester's own row is already resolved and that role's matching-phase
  // gate already applied by lib/matching.ts findMatchesFor.
  findMatches(requester: Teacher): Promise<MatchResult[]>
  // Reciprocal-pair predicate between two rows of this role, used for
  // aggregate counts (stats) and the admin coverage views.
  isMutualPair(a: PairRow, b: PairRow): boolean
}
