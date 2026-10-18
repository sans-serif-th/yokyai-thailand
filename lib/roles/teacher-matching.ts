import { requiresTeachingGroup } from '../positions'
import { createServiceClient } from '../supabase-server'
import { sanitizeForMatch } from '../match-sanitize'
import type { Destination, MatchResult, MatchTier, Teacher } from '../types'

// PostgREST encodes `.in()` filters straight into the request URL, so a
// large enough id list (hundreds+) can produce a URL long enough for the
// underlying fetch to refuse to send it at all — this is exactly what broke
// dev mode's teacher list once facebook_import rows passed ~1,000. Batch
// instead of passing the whole list to one .in() call.
const IN_CHUNK_SIZE = 200

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size))
  return chunks
}

export async function fetchDestinationsForTeacherIds(
  supabase: ReturnType<typeof createServiceClient>,
  teacherIds: string[]
): Promise<Destination[]> {
  // Chunks are independent queries — run them concurrently instead of one
  // at a time so a popular subject with several hundred candidates doesn't
  // turn into several sequential round-trips on the matches/favorites tabs.
  const pages = await Promise.all(
    chunk(teacherIds, IN_CHUNK_SIZE).map((idsChunk) =>
      supabase.from('destinations').select('*').in('teacher_id', idsChunk)
    )
  )
  const all: Destination[] = []
  for (const { data, error } of pages) {
    if (error) throw error
    all.push(...((data as Destination[]) ?? []))
  }
  return all
}

// A candidate C is a valid Match for requester R iff:
//   1. same position (ครูผู้สอน and นักจัดการงานทั่วไป are different
//      classifications and can't swap with each other)
//   2. same service_type (สพป./สพม./สอศ. — different administrative systems
//      can't swap with each other)
//   3. if position requires it (ครูผู้สอน only), the exact same subject
//      (เอก) — a teacher with no subject on file can't be matched at all,
//      since "unspecified" is not the same as "the same subject"
//   4. C.origin_province is one of R's destination provinces
//   5. R.origin_province is one of C's destination provinces
//
// Ranked into tiers (see docs/CONTEXT.md "Match / Mutual Match"):
//   perfect: exact subject matches AND both sides' district preferences
//            (where specified) are satisfied
//   high:    exact subject matches, district unconstrained or unmet
//   partial: base match only — the only tier reachable when the position has
//            no subject (e.g. นักจัดการงานทั่วไป), since subjectMatch is then
//            always false
function districtSatisfied(preferredDistrict: string | null, actualDistrict: string | null) {
  // No preference stated -> any district in the province is acceptable.
  if (!preferredDistrict) return true
  return preferredDistrict === actualDistrict
}

function rankTier(
  requester: Teacher,
  requesterDestForCandidateProvince: Destination | undefined,
  candidate: Teacher,
  candidateDestForRequesterProvince: Destination | undefined
): MatchTier {
  const subjectMatch =
    !!requester.subject && !!candidate.subject && requester.subject === candidate.subject

  const districtMatch =
    districtSatisfied(
      requesterDestForCandidateProvince?.district ?? null,
      candidate.origin_district
    ) &&
    districtSatisfied(
      candidateDestForRequesterProvince?.district ?? null,
      requester.origin_district
    )

  if (subjectMatch && districtMatch) return 'perfect'
  if (subjectMatch) return 'high'
  return 'partial'
}

// The teacher role's matcher. The round gate and requester lookup live in the
// dispatcher (lib/matching.ts findMatchesFor), which is role-agnostic.
export async function findTeacherMatches(requester: Teacher): Promise<MatchResult[]> {
  const supabase = createServiceClient()

  const { data: requesterDestinations, error: destError } = await supabase
    .from('destinations')
    .select('*')
    .eq('teacher_id', requester.id)

  if (destError) throw destError
  if (!requesterDestinations?.length) return []

  const destinationProvinces = requesterDestinations.map((d) => d.province)

  // Teachers must have a teaching group to be matched at all. The subject
  // (เอก) is optional: when both sides state one it must be identical, but a
  // side that left it blank is matched at the group level (e.g. both คณิตศาสตร์)
  // and ranks lower — see the per-candidate check below.
  if (requiresTeachingGroup(requester.position) && !requester.teaching_group) {
    return []
  }

  // Candidates: same position, same service type, (if applicable) same
  // teaching group, currently in one of the requester's desired provinces,
  // not the requester themself.
  let candidatesQuery = supabase
    .from('teachers')
    .select('*')
    // Never match across roles (categories) — each role has its own rules.
    .eq('category', requester.category)
    .eq('position', requester.position)
    .eq('service_type', requester.service_type)
    .in('origin_province', destinationProvinces)
    .neq('id', requester.id)
    .not('claimed_at', 'is', null) // Only show verified/claimed profiles

  if (requiresTeachingGroup(requester.position)) {
    candidatesQuery = candidatesQuery.eq('teaching_group', requester.teaching_group as string)
  }

  const { data: candidates, error: candidatesError } = await candidatesQuery

  if (candidatesError) throw candidatesError
  if (!candidates?.length) return []

  const candidateIds = candidates.map((c) => c.id)
  const candidateDestinations = await fetchDestinationsForTeacherIds(supabase, candidateIds)

  const destinationsByTeacher = new Map<string, Destination[]>()
  for (const d of candidateDestinations) {
    const list = destinationsByTeacher.get(d.teacher_id) ?? []
    list.push(d)
    destinationsByTeacher.set(d.teacher_id, list)
  }

  const results: MatchResult[] = []
  for (const candidate of candidates as Teacher[]) {
    // Both stated a subject -> they must be the same one. A blank on either
    // side falls back to the group match already applied in the query.
    if (
      requiresTeachingGroup(requester.position) &&
      requester.subject &&
      candidate.subject &&
      requester.subject !== candidate.subject
    ) {
      continue
    }

    const candidateDests = destinationsByTeacher.get(candidate.id) ?? []
    const candidateDestForRequesterProvince = candidateDests.find(
      (d) => d.province === requester.origin_province
    )
    // Reciprocity check: candidate must actually want the requester's province.
    if (!candidateDestForRequesterProvince) continue

    const requesterDestForCandidateProvince = requesterDestinations.find(
      (d) => d.province === candidate.origin_province
    )

    const tier = rankTier(
      requester as Teacher,
      requesterDestForCandidateProvince,
      candidate,
      candidateDestForRequesterProvince
    )

    results.push({
      teacher: sanitizeForMatch(candidate),
      destinations: candidateDests,
      tier,
      favorited: false,
    })
  }

  const tierOrder: Record<MatchTier, number> = { perfect: 0, high: 1, partial: 2 }
  results.sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier])

  return results
}
