import { findMatchesFor } from './matching'
import { sanitizeForMatch } from './match-sanitize'
import { fetchDestinationsForTeacherIds } from './roles/teacher-matching'
import { getActiveRound } from './rounds'
import { createServiceClient } from './supabase-server'
import type { Destination, FavoriteRound, MatchResult, Teacher } from './types'

async function getTeacher(lineUserId: string): Promise<Teacher> {
  const supabase = createServiceClient()
  const { data: teacher, error } = await supabase
    .from('teachers')
    .select('*')
    .eq('line_user_id', lineUserId)
    .single()

  if (error || !teacher) {
    throw new Error('Teacher profile not found — complete your profile first')
  }
  return teacher
}

// A favorite belongs to one round (favorites.round_id, see 0036): each round
// has its own list, and a new round starts with none.
export async function getFavoriteIdsFor(lineUserId: string): Promise<Set<string>> {
  const teacher = await getTeacher(lineUserId)
  const activeRound = await getActiveRound(teacher.category)
  if (!activeRound) return new Set()
  return new Set(await favoriteIdsInRound(teacher.id, activeRound.id))
}

async function favoriteIdsInRound(teacherId: string, roundId: string): Promise<string[]> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('favorites')
    .select('favorited_teacher_id')
    .eq('teacher_id', teacherId)
    .eq('round_id', roundId)

  if (error) throw error
  return (data ?? []).map((row) => row.favorited_teacher_id)
}

// The rounds the favorites page can show: the active round (even while empty)
// plus every earlier round of this role the teacher saved something in,
// newest first.
export async function getFavoriteRoundsFor(teacher: Teacher): Promise<FavoriteRound[]> {
  const supabase = createServiceClient()
  const [activeRound, { data, error }] = await Promise.all([
    getActiveRound(teacher.category),
    supabase.from('favorites').select('round_id').eq('teacher_id', teacher.id).not('round_id', 'is', null),
  ])
  if (error) throw error

  const ids = new Set((data ?? []).map((row) => row.round_id as string))
  if (activeRound) ids.add(activeRound.id)
  if (ids.size === 0) return []

  const { data: rounds, error: roundsError } = await supabase
    .from('rounds')
    .select('id, label, is_active, created_at')
    .in('id', [...ids])
    .eq('category', teacher.category)
    .order('created_at', { ascending: false })
  if (roundsError) throw roundsError

  return (rounds ?? []).map((r) => ({ id: r.id, label: r.label, isActive: r.is_active }))
}

// The active round's favorites are a filtered view of live matches, not a
// stored snapshot — if a favorited teacher stops being a valid reciprocal
// match (e.g. they changed their destinations), they simply drop out of this
// list, same as they would from the main matches page.
//
// An earlier round has no live matching to filter against, so its list shows
// the teachers saved then as they are now (masked like any match card, no
// contact status): a read-only record, not a match.
export async function getFavoritedMatchesFor(
  lineUserId: string,
  roundId?: string | null
): Promise<{ matches: MatchResult[]; rounds: FavoriteRound[]; roundId: string | null }> {
  // Fetch the teacher row once and reuse it for the favorites lookup and
  // findMatchesFor, instead of each resolving it separately.
  const teacher = await getTeacher(lineUserId)
  const [activeRound, rounds] = await Promise.all([
    getActiveRound(teacher.category),
    getFavoriteRoundsFor(teacher),
  ])

  const selected = roundId ? rounds.find((r) => r.id === roundId) : undefined
  if (roundId && !selected) throw new Error('ไม่พบรอบที่เลือก')
  const targetId = selected?.id ?? activeRound?.id ?? null
  if (!targetId) return { matches: [], rounds, roundId: null }

  const favoriteIds = new Set(await favoriteIdsInRound(teacher.id, targetId))
  if (favoriteIds.size === 0) return { matches: [], rounds, roundId: targetId }

  if (targetId === activeRound?.id) {
    const matches = await findMatchesFor(lineUserId, teacher)
    return {
      matches: matches.filter((m) => favoriteIds.has(m.teacher.id)).map((m) => ({ ...m, favorited: true })),
      rounds,
      roundId: targetId,
    }
  }
  return { matches: await pastRoundCards(favoriteIds), rounds, roundId: targetId }
}

async function pastRoundCards(favoriteIds: Set<string>): Promise<MatchResult[]> {
  const supabase = createServiceClient()
  const ids = [...favoriteIds]
  const { data, error } = await supabase.from('teachers').select('*').in('id', ids)
  if (error) throw error

  const destinations = await fetchDestinationsForTeacherIds(supabase, ids)
  const byTeacher = new Map<string, Destination[]>()
  for (const d of destinations) {
    const list = byTeacher.get(d.teacher_id) ?? []
    list.push(d)
    byTeacher.set(d.teacher_id, list)
  }
  return ((data ?? []) as Teacher[]).map((t) => ({
    teacher: sanitizeForMatch(t),
    destinations: byTeacher.get(t.id) ?? [],
    tier: 'partial' as const,
    favorited: true,
  }))
}

// Stamps the favorite with the round that is active right now, so re-favoriting
// the same teacher in a later round adds a row to that round's list instead
// of moving the old one. Saving needs an active round to belong to.
export async function addFavorite(lineUserId: string, favoritedTeacherId: string): Promise<void> {
  const teacher = await getTeacher(lineUserId)
  const activeRound = await getActiveRound(teacher.category)
  if (!activeRound) throw new Error('ยังไม่มีรอบที่เปิดอยู่')
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('favorites')
    .upsert(
      { teacher_id: teacher.id, favorited_teacher_id: favoritedTeacherId, round_id: activeRound.id },
      { onConflict: 'teacher_id,favorited_teacher_id,round_id' }
    )
  if (error) throw error
}

// Only the active round's list can change; earlier rounds are a record.
export async function removeFavorite(lineUserId: string, favoritedTeacherId: string): Promise<void> {
  const teacher = await getTeacher(lineUserId)
  const activeRound = await getActiveRound(teacher.category)
  if (!activeRound) throw new Error('ยังไม่มีรอบที่เปิดอยู่')
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('teacher_id', teacher.id)
    .eq('favorited_teacher_id', favoritedTeacherId)
    .eq('round_id', activeRound.id)
  if (error) throw error
}
