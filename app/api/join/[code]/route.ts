import { NextResponse } from 'next/server'
import { claimInvite, getInviteByCode } from '@/lib/invites'
import { LineAuthError, verifyRequestAuth } from '@/lib/line-auth'
import { validateProfilePayload } from '@/lib/profile-payload'

// Requires login — never shown to an unverified visitor, even the seed's
// own previously-public words, until LINE has confirmed who they are.
export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  try {
    await verifyRequestAuth(request)
    const invite = await getInviteByCode(code)
    if (!invite) {
      return NextResponse.json({ error: 'ลิงก์นี้ไม่ถูกต้องหรือถูกใช้งานไปแล้ว' }, { status: 404 })
    }
    return NextResponse.json(invite)
  } catch (err) {
    if (err instanceof LineAuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 })
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

// Claims the invite for the caller's LINE account.
export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  try {
    const auth = await verifyRequestAuth(request)
    const body = await request.json()

    if (!validateProfilePayload(body)) {
      return NextResponse.json({ error: 'Invalid profile payload' }, { status: 400 })
    }

    const teacher = await claimInvite(code, auth.sub, body)
    return NextResponse.json({ teacher })
  } catch (err) {
    if (err instanceof LineAuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 })
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 400 })
  }
}
