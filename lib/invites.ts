import { profilePayloadToTeacherRow } from './profile-payload'
import { createServiceClient } from './supabase-server'
import type { Destination, ProfilePayload, Teacher } from './types'

export interface InviteLookup {
  teacher: Teacher
  destinations: Destination[]
}

// Public lookup for the /join/<code> landing page — shown before login so
// the recipient can confirm this is actually their own transfer info.
export async function getInviteByCode(code: string): Promise<InviteLookup | null> {
  const supabase = createServiceClient()
  const { data: teacher, error } = await supabase
    .from('teachers')
    .select('*')
    .eq('invite_code', code)
    .eq('source', 'facebook_import')
    .maybeSingle()
  if (error) throw error
  if (!teacher) return null

  const { data: destinations, error: destError } = await supabase
    .from('destinations')
    .select('*')
    .eq('teacher_id', teacher.id)
  if (destError) throw destError

  return { teacher, destinations: destinations ?? [] }
}

// Converts a seed record into the claimant's real account: same `id` (so
// favorites already pointing at it stay valid), line_user_id/source swap
// to the real LINE account, and the code is burned so it can't be claimed
// twice. Rejects if this LINE account already has its own profile —
// claiming must never silently merge two identities.
export async function claimInvite(
  code: string,
  lineUserId: string,
  payload: ProfilePayload
): Promise<Teacher> {
  const supabase = createServiceClient()

  const { data: existing, error: existingError } = await supabase
    .from('teachers')
    .select('id')
    .eq('line_user_id', lineUserId)
    .maybeSingle()
  if (existingError) throw existingError
  if (existing) {
    throw new Error('บัญชี LINE นี้มีโปรไฟล์อยู่แล้ว ไม่สามารถเชื่อมกับข้อมูลนี้ได้')
  }

  const { data: seed, error: seedError } = await supabase
    .from('teachers')
    .select('id')
    .eq('invite_code', code)
    .eq('source', 'facebook_import')
    .maybeSingle()
  if (seedError) throw seedError
  if (!seed) {
    throw new Error('ลิงก์นี้ไม่ถูกต้องหรือถูกใช้งานไปแล้ว')
  }

  const { data: updated, error: updateError } = await supabase
    .from('teachers')
    .update({
      line_user_id: lineUserId,
      source: 'app',
      invite_code: null,
      ...profilePayloadToTeacherRow(payload),
    })
    .eq('id', seed.id)
    .select()
    .single()
  if (updateError) throw updateError

  const { error: deleteError } = await supabase
    .from('destinations')
    .delete()
    .eq('teacher_id', seed.id)
  if (deleteError) throw deleteError

  const { error: insertError } = await supabase.from('destinations').insert(
    payload.destinations.map((d) => ({
      teacher_id: seed.id,
      province: d.province,
      district: d.district,
      zone: d.zone,
    }))
  )
  if (insertError) throw insertError

  return updated
}
