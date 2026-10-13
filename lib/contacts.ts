import { findMatchesFor, maskName } from './matching'
import { notifyContact, type ContactNotice } from './line-notify'
import { createServiceClient } from './supabase-server'
import type {
  ContactDirection,
  ContactRequestView,
  ContactStatus,
  MatchContact,
  MatchResult,
  Teacher,
} from './types'
import { MAX_CONTACT_SENDS } from './types'

export interface ContactRequestRow {
  id: string
  requester_id: string
  target_id: string
  status: ContactStatus
  created_at: string
  responded_at: string | null
  send_count: number
}

function directionFor(row: ContactRequestRow, myId: string): ContactDirection {
  return row.requester_id === myId ? 'outgoing' : 'incoming'
}

function sendsLeftFor(row: ContactRequestRow, myId: string): number {
  return row.requester_id === myId ? Math.max(0, MAX_CONTACT_SENDS - row.send_count) : MAX_CONTACT_SENDS
}

// A cancelled request disappears for the target; the requester still sees it
// so they can resend.
function visibleTo(row: ContactRequestRow, myId: string): boolean {
  return row.status !== 'cancelled' || row.requester_id === myId
}

// The one place that decides what a viewer may see of the other teacher.
// Name and contact details are released only for an accepted request —
// pending and declined rows carry the masked name and a coarse summary.
export function toContactView(
  row: ContactRequestRow,
  myId: string,
  other: Teacher
): ContactRequestView {
  const accepted = row.status === 'accepted'
  return {
    id: row.id,
    status: row.status,
    direction: directionFor(row, myId),
    sendsLeft: sendsLeftFor(row, myId),
    createdAt: row.created_at,
    teacherId: other.id,
    summary: {
      position: other.position,
      teachingGroup: other.teaching_group,
      originProvince: other.origin_province,
    },
    maskedName: maskName(other.display_name),
    name: accepted ? other.display_name : null,
    lineId: accepted ? other.line_id : null,
    phone: accepted ? other.phone : null,
    facebookUrl: accepted ? other.facebook_url : null,
  }
}

async function getTeacher(lineUserId: string): Promise<Teacher> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('teachers')
    .select('*')
    .eq('line_user_id', lineUserId)
    .single()
  if (error || !data) throw new Error('Teacher profile not found — complete your profile first')
  return data as Teacher
}

// Both sides exchange name + LINE ID, so someone with no LINE ID on file can't
// send or accept a request — otherwise the other side would get nothing back.
function requireOwnLineId(me: Teacher) {
  if (!me.line_id) throw new Error('กรุณาเพิ่ม LINE ID ในหน้าแก้ไขโปรไฟล์ก่อน')
}

// Looks up the other teacher's LINE user id and pushes a notice. Best-effort:
// notifyContact never throws, and a lookup failure is swallowed the same way.
async function notifyTeacher(teacherId: string, notice: ContactNotice): Promise<void> {
  try {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('teachers')
      .select('line_user_id')
      .eq('id', teacherId)
      .maybeSingle()
    await notifyContact((data as { line_user_id: string | null } | null)?.line_user_id, notice)
  } catch (err) {
    console.error('contact notify lookup failed', err)
  }
}

async function rowsFor(teacherId: string): Promise<ContactRequestRow[]> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('contact_requests')
    .select('*')
    .or(`requester_id.eq.${teacherId},target_id.eq.${teacherId}`)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as ContactRequestRow[]
}

// Adds `contact` to each match card so the UI can show the right button.
export async function attachContactStatus(
  lineUserId: string,
  matches: MatchResult[]
): Promise<MatchResult[]> {
  if (matches.length === 0) return matches
  const me = await getTeacher(lineUserId)
  const rows = await rowsFor(me.id)
  const byOther = new Map<string, MatchContact>()
  for (const row of rows) {
    if (!visibleTo(row, me.id)) continue
    const otherId = row.requester_id === me.id ? row.target_id : row.requester_id
    byOther.set(otherId, {
      requestId: row.id,
      status: row.status,
      direction: directionFor(row, me.id),
      sendsLeft: sendsLeftFor(row, me.id),
    })
  }
  return matches.map((m) => ({ ...m, contact: byOther.get(m.teacher.id) ?? null }))
}

export async function listContactsFor(lineUserId: string): Promise<ContactRequestView[]> {
  const me = await getTeacher(lineUserId)
  const rows = (await rowsFor(me.id)).filter((r) => visibleTo(r, me.id))
  if (rows.length === 0) return []

  const otherIds = rows.map((r) => (r.requester_id === me.id ? r.target_id : r.requester_id))
  const supabase = createServiceClient()
  const { data, error } = await supabase.from('teachers').select('*').in('id', otherIds)
  if (error) throw error
  const teachers = new Map((data as Teacher[]).map((t) => [t.id, t]))

  const views: ContactRequestView[] = []
  for (const row of rows) {
    const other = teachers.get(row.requester_id === me.id ? row.target_id : row.requester_id)
    if (other) views.push(toContactView(row, me.id, other))
  }
  return views
}

// The target must be a live reciprocal match of the requester (same check
// the matches tab uses), so a request can never reach an arbitrary teacher.
export async function createContactRequest(
  lineUserId: string,
  targetId: string
): Promise<{ status: ContactStatus; requestId: string }> {
  const me = await getTeacher(lineUserId)
  requireOwnLineId(me)
  const matches = await findMatchesFor(lineUserId, me)
  if (!matches.some((m) => m.teacher.id === targetId)) {
    throw new Error('ไม่พบคู่นี้ในผลการจับคู่ของคุณ')
  }

  const supabase = createServiceClient()
  const rows = await rowsFor(me.id)
  const existing = rows.find((r) => r.requester_id === targetId || r.target_id === targetId)

  if (existing) {
    // They already asked us — sending a request back is the same as accepting.
    if (existing.status === 'pending' && existing.target_id === me.id) {
      const { error } = await supabase
        .from('contact_requests')
        .update({ status: 'accepted', responded_at: new Date().toISOString() })
        .eq('id', existing.id)
      if (error) throw error
      await notifyTeacher(targetId, 'request_accepted')
      return { status: 'accepted', requestId: existing.id }
    }
    if (existing.status === 'declined') throw new Error('คำขอติดต่อนี้ถูกปฏิเสธแล้ว')
    if (existing.status === 'cancelled') {
      const mine = existing.requester_id === me.id
      if (mine && existing.send_count >= MAX_CONTACT_SENDS) {
        throw new Error(`ส่งคำขอถึงคนนี้ครบ ${MAX_CONTACT_SENDS} ครั้งแล้ว`)
      }
      // Re-open the row. If the other side was the one who cancelled, this is
      // the first send in the new direction.
      const { error } = await supabase
        .from('contact_requests')
        .update({
          requester_id: me.id,
          target_id: targetId,
          status: 'pending',
          send_count: mine ? existing.send_count + 1 : 1,
          created_at: new Date().toISOString(),
          responded_at: null,
        })
        .eq('id', existing.id)
      if (error) throw error
      await notifyTeacher(targetId, 'request_received')
      return { status: 'pending', requestId: existing.id }
    }
    return { status: existing.status, requestId: existing.id }
  }

  const { data: created, error } = await supabase
    .from('contact_requests')
    .insert({ requester_id: me.id, target_id: targetId })
    .select('id')
    .single()
  if (error) throw error
  await notifyTeacher(targetId, 'request_received')
  return { status: 'pending', requestId: (created as { id: string }).id }
}

export async function respondToContactRequest(
  lineUserId: string,
  requestId: string,
  accept: boolean
): Promise<void> {
  const me = await getTeacher(lineUserId)
  if (accept) requireOwnLineId(me)
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('contact_requests')
    .select('*')
    .eq('id', requestId)
    .maybeSingle()
  if (error) throw error
  const row = data as ContactRequestRow | null
  if (!row || row.target_id !== me.id) throw new Error('ไม่พบคำขอติดต่อ')
  if (row.status !== 'pending') throw new Error('คำขอนี้ตอบไปแล้ว')

  const { error: updateError } = await supabase
    .from('contact_requests')
    .update({
      status: accept ? 'accepted' : 'declined',
      responded_at: new Date().toISOString(),
    })
    .eq('id', requestId)
  if (updateError) throw updateError
  if (accept) await notifyTeacher(row.requester_id, 'request_accepted')
}

// Only the requester can cancel, and only while the request is still pending.
export async function cancelContactRequest(lineUserId: string, requestId: string): Promise<void> {
  const me = await getTeacher(lineUserId)
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('contact_requests')
    .select('*')
    .eq('id', requestId)
    .maybeSingle()
  if (error) throw error
  const row = data as ContactRequestRow | null
  if (!row || row.requester_id !== me.id) throw new Error('ไม่พบคำขอติดต่อ')
  if (row.status !== 'pending') throw new Error('ยกเลิกได้เฉพาะคำขอที่ยังรอตอบ')

  const { error: updateError } = await supabase
    .from('contact_requests')
    .update({ status: 'cancelled' })
    .eq('id', requestId)
  if (updateError) throw updateError
}
