import { NextResponse } from 'next/server'
import { LineAuthError, verifyRequestAuth } from '@/lib/line-auth'
import { getPlatformStats } from '@/lib/stats'

// Platform-wide summary shown above the search results (see
// components/stats-dashboard.tsx). Requires login like every other app
// endpoint, but returns only aggregate counts — never an individual
// teacher record.
export async function GET(request: Request) {
  try {
    await verifyRequestAuth(request)
    const stats = await getPlatformStats()
    return NextResponse.json(stats)
  } catch (err) {
    if (err instanceof LineAuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 })
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
