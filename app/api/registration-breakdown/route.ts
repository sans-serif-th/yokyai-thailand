import { NextResponse } from 'next/server'
import { LineAuthError, verifyRequestAuth } from '@/lib/line-auth'
import { getRegistrationBreakdown } from '@/lib/stats'

// Shown on matches/favorites in place of match results while the active
// round is still in its registration phase (see lib/rounds.ts). Requires
// login like every other app endpoint, but returns only aggregate counts —
// never an individual teacher record.
export async function GET(request: Request) {
  try {
    await verifyRequestAuth(request)
    const breakdown = await getRegistrationBreakdown()
    return NextResponse.json(breakdown)
  } catch (err) {
    if (err instanceof LineAuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 })
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
