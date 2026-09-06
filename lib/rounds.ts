import { FREE_DESTINATION_LIMIT, PAID_DESTINATION_LIMIT } from './package-limits'
import { createServiceClient } from './supabase-server'
import type { PackageCode, Round, SubscriptionStatus } from './types'

export { FREE_DESTINATION_LIMIT, PAID_DESTINATION_LIMIT }

export async function getActiveRound(): Promise<Round | null> {
  const supabase = createServiceClient()
  const { data, error } = await supabase.from('rounds').select('*').eq('is_active', true).maybeSingle()
  if (error) throw error
  return data
}

// No active round configured is a misconfiguration, not something a real
// user should be blocked by — fail open at the paid limit (matches the
// ceiling this app already used informally before packages existed).
export async function getSubscriptionStatusFor(lineUserId: string): Promise<SubscriptionStatus> {
  const round = await getActiveRound()
  if (!round) {
    return { round: null, package: 'free', verified: false, maxDestinations: PAID_DESTINATION_LIMIT, slipUploaded: false }
  }

  const supabase = createServiceClient()
  const { data: teacher, error: teacherError } = await supabase
    .from('teachers')
    .select('id')
    .eq('line_user_id', lineUserId)
    .maybeSingle()
  if (teacherError) throw teacherError
  if (!teacher) {
    return { round, package: 'free', verified: false, maxDestinations: FREE_DESTINATION_LIMIT, slipUploaded: false }
  }

  const { data: sub, error: subError } = await supabase
    .from('round_subscriptions')
    .select('package, slip_url, verified_at')
    .eq('teacher_id', teacher.id)
    .eq('round_id', round.id)
    .maybeSingle()
  if (subError) throw subError

  const verified = !!sub?.verified_at
  const pkg: PackageCode = sub?.package === 'paid' && verified ? 'paid' : 'free'

  return {
    round,
    package: pkg,
    verified,
    maxDestinations: pkg === 'paid' ? PAID_DESTINATION_LIMIT : FREE_DESTINATION_LIMIT,
    slipUploaded: !!sub?.slip_url,
  }
}

// Called when a teacher uploads a payment slip — creates/updates their
// round_subscription as pending ('paid' package, verified_at still null
// until an admin checks the slip and sets it manually).
export async function recordSlipUpload(lineUserId: string, slipPath: string): Promise<void> {
  const round = await getActiveRound()
  if (!round) throw new Error('ไม่มีรอบที่เปิดใช้งานอยู่ในขณะนี้')

  const supabase = createServiceClient()
  const { data: teacher, error: teacherError } = await supabase
    .from('teachers')
    .select('id')
    .eq('line_user_id', lineUserId)
    .maybeSingle()
  if (teacherError) throw teacherError
  if (!teacher) throw new Error('Teacher profile not found — complete your profile first')

  const { error } = await supabase
    .from('round_subscriptions')
    .upsert(
      {
        teacher_id: teacher.id,
        round_id: round.id,
        package: 'paid',
        slip_url: slipPath,
        verified_at: null,
      },
      { onConflict: 'teacher_id,round_id' }
    )
  if (error) throw error
}
