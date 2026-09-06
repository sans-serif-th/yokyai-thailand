import { NextResponse } from 'next/server'
import { getFavoriteIdsFor } from '@/lib/favorites'
import { LineAuthError, verifyRequestAuth } from '@/lib/line-auth'
import { findMatchesFor } from '@/lib/matching'

export async function GET(request: Request) {
  try {
    const auth = await verifyRequestAuth(request)
    const [matches, favoriteIds] = await Promise.all([
      findMatchesFor(auth.sub),
      getFavoriteIdsFor(auth.sub),
    ])
    const withFavorited = matches.map((m) => ({
      ...m,
      favorited: favoriteIds.has(m.teacher.id),
    }))
    return NextResponse.json({ matches: withFavorited })
  } catch (err) {
    if (err instanceof LineAuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 })
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
