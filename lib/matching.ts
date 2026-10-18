import { sanitizeForMatch } from './match-sanitize'
import { getRoleImplementation } from './roles'
import { getActiveRound, isRoundInMatchingPhase } from './rounds'
import { createServiceClient, fetchAllRows } from './supabase-server'
import { fetchDestinationsForTeacherIds } from './roles/teacher-matching'
import type { Destination, MatchResult, Teacher } from './types'

// Re-exported so existing importers keep working; the helpers moved to
// lib/match-sanitize.ts so lib/roles/* can use them without a cycle.
export { maskName, sanitizeForMatch } from './match-sanitize'

// `preloadedRequester` lets a caller that already fetched this user's row
// (e.g. getFavoritedMatchesFor, which needs it anyway to resolve favorite
// ids) skip a second identical lookup here.
//
// Role-agnostic entry point: applies the global matching-phase gate, resolves
// the requester and hands off to that role's matcher (lib/roles/). The
// teacher algorithm itself lives in lib/roles/teacher-matching.ts.
export async function findMatchesFor(
  lineUserId: string,
  preloadedRequester?: Teacher
): Promise<MatchResult[]> {
  // Global registration-period / matching-phase gate (see lib/rounds.ts):
  // nobody's search resolves into a real result until the active round
  // reaches its matching phase, regardless of how this function is called
  // (page component or a direct API request) — this is the authoritative
  // check, not just a UI-level one.
  const activeRound = await getActiveRound()
  if (!isRoundInMatchingPhase(activeRound)) return []

  const supabase = createServiceClient()

  let requester = preloadedRequester
  if (!requester) {
    const { data, error: requesterError } = await supabase
      .from('teachers')
      .select('*')
      .eq('line_user_id', lineUserId)
      .single()

    if (requesterError || !data) {
      throw new Error('Teacher profile not found — complete your profile first')
    }
    requester = data as Teacher
  }

  const role = getRoleImplementation(requester.category)
  if (!role) return []
  return role.findMatches(requester)
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

  // Page through with .range() — a plain select silently caps at 1000 rows
  // once the table passes that size (see fetchAllRows), which facebook_import
  // rows alone now do post-bulk-import.
  const { data: teachers, error } = await fetchAllRows((from, to) =>
    supabase
      .from('teachers')
      .select('*')
      .eq('source', 'facebook_import')
      .order('created_at', { ascending: false })
      .range(from, to)
  )

  if (error) throw error
  if (!teachers?.length) return []

  const teacherIds = teachers.map((t) => t.id)
  const destinations = await fetchDestinationsForTeacherIds(supabase, teacherIds)

  const destinationsByTeacher = new Map<string, Destination[]>()
  for (const d of destinations) {
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
