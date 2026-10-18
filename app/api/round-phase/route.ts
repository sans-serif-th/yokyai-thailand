import { NextResponse } from 'next/server'
import { LineAuthError, verifyRequestAuth } from '@/lib/line-auth'
import { DEFAULT_ROLE, getActiveRound, roundPhase } from '@/lib/rounds'
import { createServiceClient } from '@/lib/supabase-server'

// Cheap phase check called on every matches/favorites load — separate from
// the heavier registration-breakdown endpoint, which is only fetched when
// actually not in the matching phase. Rounds are per role, so the phase is
// that of the caller's own role (no profile yet = the default role).
export async function GET(request: Request) {
  try {
    const auth = await verifyRequestAuth(request)
    const supabase = createServiceClient()
    const { data: teacher, error } = await supabase
      .from('teachers')
      .select('category')
      .eq('line_user_id', auth.sub)
      .maybeSingle()
    if (error) throw error

    const round = await getActiveRound(teacher?.category ?? DEFAULT_ROLE)
    const phase = roundPhase(round)
    return NextResponse.json({
      inMatchingPhase: phase === 'matching',
      phase,
      roundLabel: round?.label ?? null,
    })
  } catch (err) {
    if (err instanceof LineAuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 })
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
