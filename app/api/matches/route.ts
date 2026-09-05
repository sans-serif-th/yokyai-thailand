import { NextResponse } from 'next/server'
import { LineAuthError, verifyRequestAuth } from '@/lib/line-auth'
import { findMatchesFor } from '@/lib/matching'

export async function GET(request: Request) {
  try {
    const auth = await verifyRequestAuth(request)
    const matches = await findMatchesFor(auth.sub)
    return NextResponse.json({ matches })
  } catch (err) {
    if (err instanceof LineAuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 })
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
