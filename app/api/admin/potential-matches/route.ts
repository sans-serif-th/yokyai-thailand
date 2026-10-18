import { listCrossPairs } from '@/lib/roles/pairs'
import { createServiceClient, fetchAllRows } from '@/lib/supabase-server'
import { checkAdminToken } from '@/lib/admin-token'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')

  if (!checkAdminToken(token)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  const SELECT_FIELDS = `
    id,
    line_user_id,
    category,
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

  // A seed and a real user pair up when each wants the other's origin
  // province (plus the role's own rules — lib/roles/pairs.ts).
  const potentialMatches = listCrossPairs(unclaimed, realUsers).map(({ left: seed, right: realUser }) => ({
    seed: { ...seed, destinations: seed.destinations || [] },
    realUser: { ...realUser, destinations: realUser.destinations || [] },
  }))

  return Response.json(potentialMatches)
}
