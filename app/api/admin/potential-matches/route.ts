import { requiresTeachingGroup } from '@/lib/positions'
import { createServiceClient, fetchAllRows } from '@/lib/supabase-server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')

  // Simple token validation (check if it's a valid admin token)
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

  const SELECT_FIELDS = `
    id,
    line_user_id,
    display_name,
    position,
    service_type,
    origin_province,
    teaching_group,
    subject,
    transfer_round,
    transfer_year,
    source,
    claimed_at,
    destinations (*)
  `

  // Get all unclaimed seeds (facebook_import, claimed_at IS NULL) and all
  // claimed real users (source = app) in two queries total, then match them
  // in memory. Previously this ran one "claimed real users" query per seed,
  // which was fine at the original data scale but turned into 1,000+
  // sequential round-trips (and an admin dashboard stuck on "Loading...")
  // once the bulk Facebook-import batches pushed unclaimed seeds into the
  // thousands.
  // Page through with .range() — a plain select silently caps at 1000 rows
  // once a side of the query passes that size (see fetchAllRows), which the
  // unclaimed-seed side already does post-bulk-import.
  const [unclaimedRes, realUsersRes] = await Promise.all([
    fetchAllRows((from, to) =>
      supabase
        .from('teachers')
        .select(SELECT_FIELDS)
        .eq('source', 'facebook_import')
        .is('claimed_at', null)
        .range(from, to)
    ),
    fetchAllRows((from, to) =>
      supabase
        .from('teachers')
        .select(SELECT_FIELDS)
        .eq('source', 'app')
        .not('claimed_at', 'is', null)
        .range(from, to)
    ),
  ])

  if (unclaimedRes.error) {
    return Response.json({ error: unclaimedRes.error.message }, { status: 500 })
  }
  if (realUsersRes.error) {
    return Response.json({ error: realUsersRes.error.message }, { status: 500 })
  }

  const unclaimed = unclaimedRes.data || []
  const realUsers = realUsersRes.data || []

  // Find matches where:
  // - Real user wants to go to seed's origin province
  // - Seed wants to go to real user's origin province
  const potentialMatches = []
  for (const seed of unclaimed) {
    for (const realUser of realUsers) {
      if (realUser.position !== seed.position) continue
      if (realUser.service_type !== seed.service_type) continue
      // The exact subject must match — not just the broader teaching_group
      // — and an unspecified subject on either side can't count as a match.
      if (requiresTeachingGroup(seed.position) && (!seed.subject || seed.subject !== realUser.subject))
        continue

      const seedWantsRealUserOrigin = seed.destinations?.some(
        (d: any) => d.province === realUser.origin_province
      )
      const realUserWantsSeedOrigin = realUser.destinations?.some(
        (d: any) => d.province === seed.origin_province
      )

      if (seedWantsRealUserOrigin && realUserWantsSeedOrigin) {
        potentialMatches.push({
          seed: {
            ...seed,
            destinations: seed.destinations || [],
          },
          realUser: {
            ...realUser,
            destinations: realUser.destinations || [],
          },
        })
      }
    }
  }

  return Response.json(potentialMatches)
}
