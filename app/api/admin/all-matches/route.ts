import { createServiceClient, fetchAllRows } from '@/lib/supabase-server'
import { requiresTeachingGroup } from '@/lib/positions'
import type { Destination, Teacher } from '@/lib/types'

// Admin-only view of match *density* across the entire dataset — every
// mutual pair that satisfies the real matching criteria (position,
// service_type, exact subject, reciprocal destinations), regardless of
// claimed_at/source. This answers "do we have enough users for matching to
// work" — a different question from /api/admin/potential-matches, which
// only surfaces pairs an admin can actually act on today (an unclaimed seed
// paired with an already-claimed real user). A real end user only ever sees
// verified counterparts (lib/matching.ts), so this pairing (which includes
// unclaimed seeds on both sides) is never shown outside /admin.
export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')

  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    if (!decoded.startsWith('admin:')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
  } catch {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  // Page through with .range() — a plain select silently caps at 1000 rows
  // once the table passes that size (see fetchAllRows), which would quietly
  // undercount coverage once the dataset grows past it.
  const { data: teachers, error } = await fetchAllRows((from, to) =>
    supabase
      .from('teachers')
      .select(`
        *,
        destinations (*)
      `)
      .range(from, to)
  )

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  const all = (teachers || []) as (Teacher & { destinations: Destination[] })[]

  const pairs: {
    a: Teacher & { destinations: Destination[] }
    b: Teacher & { destinations: Destination[] }
  }[] = []

  for (let i = 0; i < all.length; i++) {
    const a = all[i]
    if (!a.destinations?.length) continue

    for (let j = i + 1; j < all.length; j++) {
      const b = all[j]
      if (!b.destinations?.length) continue

      if (a.position !== b.position) continue
      if (a.service_type !== b.service_type) continue
      // The exact subject must match — not just the broader teaching_group
      // — and an unspecified subject on either side can't count as a match.
      if (requiresTeachingGroup(a.position) && (!a.subject || a.subject !== b.subject)) continue

      const aWantsBOrigin = a.destinations.some((d) => d.province === b.origin_province)
      const bWantsAOrigin = b.destinations.some((d) => d.province === a.origin_province)

      if (aWantsBOrigin && bWantsAOrigin) {
        pairs.push({ a, b })
      }
    }
  }

  return Response.json({
    totalTeachers: all.length,
    teachersWithDestinations: all.filter((t) => t.destinations?.length).length,
    matchCount: pairs.length,
    pairs,
  })
}
