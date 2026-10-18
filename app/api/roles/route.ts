import { NextResponse } from 'next/server'
import { LineAuthError, verifyRequestAuth } from '@/lib/line-auth'
import { listRoles } from '@/lib/roles/server'

// Roles shown on the welcome screen: active ones are selectable, coming_soon
// ones are listed as "เร็วๆนี้"; hidden ones are left out.
export async function GET(request: Request) {
  try {
    await verifyRequestAuth(request)
    const roles = (await listRoles()).filter((r) => r.status !== 'hidden')
    return NextResponse.json({ roles })
  } catch (err) {
    if (err instanceof LineAuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 })
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
