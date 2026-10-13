import { NextResponse } from 'next/server'
import { respondToContactRequest } from '@/lib/contacts'
import { LineAuthError, verifyRequestAuth } from '@/lib/line-auth'

// Body: { action: 'accept' | 'decline' } — only the request's target may answer.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const auth = await verifyRequestAuth(request)
    const body = await request.json()
    const action = (body as { action?: unknown })?.action
    if (action !== 'accept' && action !== 'decline') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
    await respondToContactRequest(auth.sub, id, action === 'accept')
    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof LineAuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 })
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 400 })
  }
}
