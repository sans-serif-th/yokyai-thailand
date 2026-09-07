import { NextResponse } from 'next/server'
import { LineAuthError, verifyRequestAuth } from '@/lib/line-auth'
import { getActiveRound, isRoundInMatchingPhase } from '@/lib/rounds'

// Cheap phase check called on every matches/favorites load — separate from
// the heavier registration-breakdown endpoint, which is only fetched when
// actually still in registration phase.
export async function GET(request: Request) {
  try {
    await verifyRequestAuth(request)
    const round = await getActiveRound()
    return NextResponse.json({
      inMatchingPhase: isRoundInMatchingPhase(round),
      roundLabel: round?.label ?? null,
    })
  } catch (err) {
    if (err instanceof LineAuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 })
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
