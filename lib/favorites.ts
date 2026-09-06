import { findMatchesFor } from './matching'
import { createServiceClient } from './supabase-server'
import type { MatchResult, Teacher } from './types'

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

async function getTeacherId(lineUserId: string): Promise<string> {
  return (await getTeacher(lineUserId)).id
}

export async function getFavoriteIdsFor(lineUserId: string): Promise<Set<string>> {
  const teacherId = await getTeacherId(lineUserId)
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('favorites')
    .select('favorited_teacher_id')
    .eq('teacher_id', teacherId)

  if (error) throw error
  return new Set((data ?? []).map((row) => row.favorited_teacher_id))
}

// Favorites are shown as a filtered view of live matches, not a separately
// stored snapshot — if a favorited teacher stops being a valid reciprocal
// match (e.g. they changed their destinations), they simply drop out of
// this list, same as they would from the main matches page.
export async function getFavoritedMatchesFor(lineUserId: string): Promise<MatchResult[]> {
  // Fetch the teacher row once and reuse it for both the favorites lookup
  // and findMatchesFor, instead of each resolving it separately.
  const teacher = await getTeacher(lineUserId)
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('favorites')
    .select('favorited_teacher_id')
    .eq('teacher_id', teacher.id)

  if (error) throw error
  const favoriteIds = new Set((data ?? []).map((row) => row.favorited_teacher_id))
  if (favoriteIds.size === 0) return []

  const matches = await findMatchesFor(lineUserId, teacher)
  return matches
    .filter((m) => favoriteIds.has(m.teacher.id))
    .map((m) => ({ ...m, favorited: true }))
}

export async function addFavorite(lineUserId: string, favoritedTeacherId: string): Promise<void> {
  const teacherId = await getTeacherId(lineUserId)
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('favorites')
    .upsert(
      { teacher_id: teacherId, favorited_teacher_id: favoritedTeacherId },
      { onConflict: 'teacher_id,favorited_teacher_id' }
    )
  if (error) throw error
}

export async function removeFavorite(lineUserId: string, favoritedTeacherId: string): Promise<void> {
  const teacherId = await getTeacherId(lineUserId)
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('teacher_id', teacherId)
    .eq('favorited_teacher_id', favoritedTeacherId)
  if (error) throw error
}
