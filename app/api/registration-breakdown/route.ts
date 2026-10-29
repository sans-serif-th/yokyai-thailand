import { NextResponse } from 'next/server'
import { LineAuthError, verifyRequestAuth } from '@/lib/line-auth'
import { DEFAULT_ROLE, getActiveRound } from '@/lib/rounds'
import { createServiceClient } from '@/lib/supabase-server'
import { getRegistrationBreakdown } from '@/lib/stats'

// Shown on matches/favorites in place of match results while the active
// round is still in its registration phase (see lib/rounds.ts). Requires
// login like every other app endpoint, but returns only aggregate counts —
// never an individual teacher record.
export async function GET(request: Request) {
  try {
    const auth = await verifyRequestAuth(request)
    // Counts cover the caller's own role only (no profile yet = default role).
    const { data: teacher, error } = await createServiceClient()
      .from('teachers')
      .select('category')
      .eq('line_user_id', auth.sub)
      .maybeSingle()
    if (error) throw error
    const category = teacher?.category ?? DEFAULT_ROLE
    const [breakdown, round] = await Promise.all([getRegistrationBreakdown(category), getActiveRound(category)])
    // The round's dates feed the card text; they are not personal data.
    const schedule = round && {
      registrationOpensAt: round.registration_opens_at,
      registrationClosesAt: round.registration_closes_at,
      matchingOpensAt: round.matching_opens_at,
      matchingClosesAt: round.matching_closes_at,
    }
    return NextResponse.json({ ...breakdown, schedule: schedule ?? undefined })
  } catch (err) {
    if (err instanceof LineAuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 })
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
