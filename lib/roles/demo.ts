import { createServiceClient } from '../supabase-server'
import { sanitizeForMatch } from '../match-sanitize'
import type { Destination, MatchResult, ProfilePayload, Teacher } from '../types'
import { DEMO_FIELDS, DEMO_ROLE_CODE, DEMO_TABLE } from './demo-fields'
import { loadExtension, rowToProfile } from './extension'
import { fieldsInTable, fieldsToRow, validateFields } from './fields'
import { fetchDestinationsForTeacherIds } from './teacher-matching'
import type { PairRow, RoleImplementation } from './types'

const CORE_FIELDS = fieldsInTable(DEMO_FIELDS, undefined)
const EXTENSION_FIELDS = fieldsInTable(DEMO_FIELDS, DEMO_TABLE)

// Rule for the example role: same specialty, and each side wants the other's
// origin province. (Rows lacking a specialty — pair counting selects no
// extension data — are paired on provinces alone.)
function isDemoMutualPair(a: PairRow, b: PairRow): boolean {
  if (!a.destinations?.length || !b.destinations?.length) return false
  const sa = a.profile?.specialty
  const sb = b.profile?.specialty
  if (sa && sb && sa !== sb) return false
  return (
    a.destinations.some((d) => d.province === b.origin_province) &&
    b.destinations.some((d) => d.province === a.origin_province)
  )
}

async function findDemoMatches(requester: Teacher): Promise<MatchResult[]> {
  const supabase = createServiceClient()

  const { data: dests, error: destError } = await supabase
    .from('destinations')
    .select('*')
    .eq('teacher_id', requester.id)
  if (destError) throw destError
  if (!dests?.length) return []

  const mine = await loadExtension(supabase, demoRole, requester.id)
  if (!mine?.specialty) return []

  const { data: candidates, error } = await supabase
    .from('teachers')
    .select(`*, ${DEMO_TABLE} (*)`)
    .eq('category', DEMO_ROLE_CODE)
    .in('origin_province', dests.map((d) => d.province))
    .neq('id', requester.id)
    .not('claimed_at', 'is', null)
  if (error) throw error
  if (!candidates?.length) return []

  const destinations = await fetchDestinationsForTeacherIds(supabase, candidates.map((c) => c.id))
  const byTeacher = new Map<string, Destination[]>()
  for (const d of destinations) byTeacher.set(d.teacher_id, [...(byTeacher.get(d.teacher_id) ?? []), d])

  const results: MatchResult[] = []
  for (const row of candidates) {
    const { [DEMO_TABLE]: ext, ...core } = row as Record<string, unknown>
    const extRow = (Array.isArray(ext) ? ext[0] : ext) as Record<string, unknown> | null | undefined
    const profile = extRow ? rowToProfile(EXTENSION_FIELDS, extRow) : null
    if (!profile || profile.specialty !== mine.specialty) continue

    const theirs = byTeacher.get(core.id as string) ?? []
    if (!theirs.some((d) => d.province === requester.origin_province)) continue

    results.push({
      teacher: sanitizeForMatch({ ...(core as unknown as Teacher), profile }),
      destinations: theirs,
      tier: 'high',
      favorited: false,
    })
  }
  return results
}

// The example role (see docs/adding-a-role.md): a field list, a matcher and an
// extension table — nothing else.
export const demoRole: RoleImplementation = {
  code: DEMO_ROLE_CODE,
  fields: DEMO_FIELDS,
  extensionTable: DEMO_TABLE,
  validateProfile(body: unknown): body is ProfilePayload {
    if (!body || typeof body !== 'object') return false
    const b = body as Record<string, unknown>
    if (!validateFields(CORE_FIELDS, b)) return false
    const profile = b.profile
    if (!profile || typeof profile !== 'object') return false
    if (!validateFields(EXTENSION_FIELDS, profile as Record<string, unknown>)) return false
    return (
      Array.isArray(b.destinations) &&
      b.destinations.length > 0 &&
      b.destinations.every((d) => d && typeof d === 'object' && typeof (d as { province?: unknown }).province === 'string')
    )
  },
  profileToRow: (payload) => fieldsToRow(CORE_FIELDS, payload as unknown as Record<string, unknown>),
  findMatches: findDemoMatches,
  isMutualPair: isDemoMutualPair,
}
