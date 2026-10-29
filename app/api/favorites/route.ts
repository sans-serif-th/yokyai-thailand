import { NextResponse } from 'next/server'
import { attachContactStatus } from '@/lib/contacts'
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
    const roundId = new URL(request.url).searchParams.get('round')
    const { matches, rounds, roundId: shownRoundId } = await getFavoritedMatchesFor(auth.sub, roundId)
    const active = rounds.find((r) => r.isActive)
    // Contact status only means something for the live round.
    const shown = shownRoundId === active?.id ? await attachContactStatus(auth.sub, matches) : matches
    return NextResponse.json({ matches: shown, rounds, roundId: shownRoundId })
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
