import { NextResponse } from 'next/server'
import { LineAuthError, verifyRequestAuth } from '@/lib/line-auth'
import { getImportedTeachersForDev } from '@/lib/matching'

// Dev-only endpoint: lists every facebook_import row unfiltered, for
// eyeballing scraped-import data on a real deployment. Set
// NEXT_PUBLIC_DEV_TOOLS=1 in the environment to turn it on — off (404) by
// default so it never accidentally ships live. Still requires a real LINE
// login on top of that (not a public endpoint even when enabled).
const DEV_TOOLS_ENABLED = process.env.NEXT_PUBLIC_DEV_TOOLS === '1'

export async function GET(request: Request) {
  if (!DEV_TOOLS_ENABLED) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    await verifyRequestAuth(request)
    const matches = await getImportedTeachersForDev()
    return NextResponse.json({ matches })
  } catch (err) {
    if (err instanceof LineAuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 })
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
