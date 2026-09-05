import { createServiceClient } from './supabase-server'
import type { Destination, MatchResult, MatchTier, Teacher } from './types'

// A candidate C is a valid Match for requester R iff:
//   1. same teaching_group
//   2. C.origin_province is one of R's destination provinces
//   3. R.origin_province is one of C's destination provinces
//
// Ranked into tiers (see docs/CONTEXT.md "Match / Mutual Match"):
//   perfect: exact subject matches AND both sides' district preferences
//            (where specified) are satisfied
//   high:    exact subject matches, district unconstrained or unmet
//   partial: teaching-group match only
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

  // Candidates: same teaching group, currently in one of the requester's
  // desired provinces, not the requester themself.
  const { data: candidates, error: candidatesError } = await supabase
    .from('teachers')
    .select('*')
    .eq('teaching_group', requester.teaching_group)
    .in('origin_province', destinationProvinces)
    .neq('id', requester.id)

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

    results.push({ teacher: candidate, destinations: candidateDests, tier })
  }

  const tierOrder: Record<MatchTier, number> = { perfect: 0, high: 1, partial: 2 }
  results.sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier])

  return results
}
