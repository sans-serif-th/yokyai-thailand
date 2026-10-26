import { NextResponse } from 'next/server'
import { cancelContactRequest, respondToContactRequest } from '@/lib/contacts'
import { LineAuthError, verifyRequestAuth } from '@/lib/line-auth'

// Body: { action: 'accept' | 'decline' | 'cancel' } — only the target may
// accept/decline; the requester may cancel a pending request, and either side
// may cancel an accepted connection.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const auth = await verifyRequestAuth(request)
    const body = await request.json()
    const action = (body as { action?: unknown })?.action
    if (action !== 'accept' && action !== 'decline' && action !== 'cancel') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
    if (action === 'cancel') await cancelContactRequest(auth.sub, id)
    else await respondToContactRequest(auth.sub, id, action === 'accept')
    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof LineAuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 })
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 400 })
  }
}
