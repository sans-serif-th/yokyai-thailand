import { NextResponse } from 'next/server'
import { createContactRequest, listContactsFor } from '@/lib/contacts'
import { LineAuthError, verifyRequestAuth } from '@/lib/line-auth'

export async function GET(request: Request) {
  try {
    const auth = await verifyRequestAuth(request)
    const contacts = await listContactsFor(auth.sub)
    return NextResponse.json({ contacts })
  } catch (err) {
    if (err instanceof LineAuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 })
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await verifyRequestAuth(request)
    const body = await request.json()
    const teacherId = (body as { teacherId?: unknown })?.teacherId
    if (typeof teacherId !== 'string' || !teacherId.trim()) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
    const result = await createContactRequest(auth.sub, teacherId)
    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof LineAuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 })
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 400 })
  }
}
