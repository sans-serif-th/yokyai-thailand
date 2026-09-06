import { NextResponse } from 'next/server'
import { addFavorite, getFavoritedMatchesFor, removeFavorite } from '@/lib/favorites'
import { LineAuthError, verifyRequestAuth } from '@/lib/line-auth'

function isValidTeacherId(body: unknown): body is { teacherId: string } {
  return (
    !!body &&
    typeof body === 'object' &&
    typeof (body as { teacherId?: unknown }).teacherId === 'string' &&
    (body as { teacherId: string }).teacherId.trim().length > 0
  )
}

export async function GET(request: Request) {
  try {
    const auth = await verifyRequestAuth(request)
    const matches = await getFavoritedMatchesFor(auth.sub)
    return NextResponse.json({ matches })
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
    if (!isValidTeacherId(body)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
    await addFavorite(auth.sub, body.teacherId)
    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof LineAuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 })
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await verifyRequestAuth(request)
    const body = await request.json()
    if (!isValidTeacherId(body)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
    await removeFavorite(auth.sub, body.teacherId)
    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof LineAuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 })
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
