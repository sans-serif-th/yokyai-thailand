import { requiresTeachingGroup } from './positions'
import { createServiceClient } from './supabase-server'
import type { Destination, MatchResult, MatchTier, Teacher } from './types'

// A candidate C is a valid Match for requester R iff:
//   1. same position (ครูผู้สอน and นักจัดการงานทั่วไป are different
//      classifications and can't swap with each other)
//   2. same service_type (สพป./สพม./สอศ. — different administrative systems
//      can't swap with each other)
//   3. if position requires it (ครูผู้สอน only), same teaching_group
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
// PDPA + invite-flow safety: a facebook_import row was never entered by the
// person it names, so its display_name is masked and its Facebook link is
// hidden before this ever leaves the server — contact happens only via an
// admin-delivered invite link (see lib/invites.ts), never shown here.
// invite_code is stripped unconditionally (not just for imports) since no
// match result should ever carry another teacher's claim code.
export function sanitizeForMatch(teacher: Teacher): Teacher {
  const imported = teacher.source === 'facebook_import'
  return {
    ...teacher,
    display_name: imported ? `${teacher.display_name.slice(0, 2)}***` : teacher.display_name,
    facebook_url: imported ? null : teacher.facebook_url,
    invite_code: null,
  }
}

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
    districtSatisfied(requesterDestForCandidateProvince?.district ?? null, candidate.origin_district) &&
    districtSatisfied(candidateDestForRequesterProvince?.district ?? null, requester.origin_district)

  if (subjectMatch && districtMatch) return 'perfect'
  if (subjectMatch) return 'high'
  return 'partial'
}

export async function findMatchesFor(lineUserId: string): Promise<MatchResult[]> {
  const supabase = createServiceClient()

  const { data: requester, error: requesterError } = await supabase
    .from('teachers')
    .select('*')
    .eq('line_user_id', lineUserId)
    .single()

  if (requesterError || !requester) {
    throw new Error('Teacher profile not found — complete your profile first')
  }

  const { data: requesterDestinations, error: destError } = await supabase
    .from('destinations')
    .select('*')
    .eq('teacher_id', requester.id)

  if (destError) throw destError
  if (!requesterDestinations?.length) return []

  const destinationProvinces = requesterDestinations.map((d) => d.province)

  // Candidates: same position, same service type, (if applicable) same
  // teaching group, currently in one of the requester's desired provinces,
  // not the requester themself.
  let candidatesQuery = supabase
    .from('teachers')
    .select('*')
    .eq('position', requester.position)
    .eq('service_type', requester.service_type)
    .in('origin_province', destinationProvinces)
    .neq('id', requester.id)

  if (requiresTeachingGroup(requester.position)) {
    candidatesQuery = candidatesQuery.eq('teaching_group', requester.teaching_group)
  }

  const { data: candidates, error: candidatesError } = await candidatesQuery

  if (candidatesError) throw candidatesError
  if (!candidates?.length) return []

  const candidateIds = candidates.map((c) => c.id)
  const { data: candidateDestinations, error: candidateDestError } = await supabase
    .from('destinations')
    .select('*')
    .in('teacher_id', candidateIds)

  if (candidateDestError) throw candidateDestError

  const destinationsByTeacher = new Map<string, Destination[]>()
  for (const d of candidateDestinations ?? []) {
    const list = destinationsByTeacher.get(d.teacher_id) ?? []
    list.push(d)
    destinationsByTeacher.set(d.teacher_id, list)
  }

  const results: MatchResult[] = []
  for (const candidate of candidates as Teacher[]) {
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

// Dev-only: every facebook_import row, unfiltered by the real matching
// criteria (position/service_type/subject/reciprocity) — for eyeballing
// scraped data after an import, not shown to real users. Gated by
// NEXT_PUBLIC_DEV_TOOLS at the route level (see app/api/matches/dev/route.ts);
// still runs every result through the same PDPA sanitization as a real match
// (masked display_name, hidden facebook_url, stripped invite_code) since this
// can be reached on a live deployment.
export async function getImportedTeachersForDev(): Promise<MatchResult[]> {
  const supabase = createServiceClient()

  const { data: teachers, error } = await supabase
    .from('teachers')
    .select('*')
    .eq('source', 'facebook_import')
    .order('created_at', { ascending: false })

  if (error) throw error
  if (!teachers?.length) return []

  const teacherIds = teachers.map((t) => t.id)
  const { data: destinations, error: destError } = await supabase
    .from('destinations')
    .select('*')
    .in('teacher_id', teacherIds)

  if (destError) throw destError

  const destinationsByTeacher = new Map<string, Destination[]>()
  for (const d of destinations ?? []) {
    const list = destinationsByTeacher.get(d.teacher_id) ?? []
    list.push(d)
    destinationsByTeacher.set(d.teacher_id, list)
  }

  return (teachers as Teacher[]).map((teacher) => ({
    teacher: sanitizeForMatch(teacher),
    destinations: destinationsByTeacher.get(teacher.id) ?? [],
    tier: 'partial' as const,
    favorited: false,
  }))
}
