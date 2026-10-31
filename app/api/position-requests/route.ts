import { NextResponse } from 'next/server'
import { LineAuthError, verifyRequestAuth } from '@/lib/line-auth'
import { normalizePositionRequest, validatePositionRequest } from '@/lib/position-request'
import { isOverPositionRequestLimit, positionRequestsSentToday } from '@/lib/rate-limit'
import { createServiceClient } from '@/lib/supabase-server'

// A user who could not find their position in the registration dropdown asks
// the team to add it. Login is required (no anonymous spam) but a profile is
// not: the user is still registering. Rows are only readable by the team.
export async function POST(request: Request) {
  try {
    const auth = await verifyRequestAuth(request)
    const input = normalizePositionRequest(await request.json().catch(() => null))
    const invalid = validatePositionRequest(input)
    if (invalid) return NextResponse.json({ error: invalid }, { status: 400 })

    // A person has few positions to add; more than this a day is spam.
    if (isOverPositionRequestLimit(await positionRequestsSentToday(auth.sub))) {
      return NextResponse.json({ error: 'ส่งคำขอครบจำนวนต่อวันแล้ว กรุณาลองใหม่พรุ่งนี้' }, { status: 429 })
    }

    const { error } = await createServiceClient().from('position_requests').insert({
      line_user_id: auth.sub,
      position_name: input.positionName,
      transfer_round: input.transferRound || null,
      criteria: input.criteria,
      contact_consent: input.contactConsent,
    })
    if (error) throw error
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (err) {
    if (err instanceof LineAuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 })
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
