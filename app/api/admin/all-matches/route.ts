import { createServiceClient, fetchAllRows } from '@/lib/supabase-server'
import { listMutualPairs } from '@/lib/roles/pairs'
import type { Destination, Teacher } from '@/lib/types'
import { checkAdminToken } from '@/lib/admin-token'

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
  // Role (ประเภทผู้ใช้) the dashboard is showing; omitted = every role.
  const category = url.searchParams.get('category')

  if (!checkAdminToken(token)) {
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
      .match(category ? { category } : {})
      .range(from, to)
  )

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  const all = (teachers || []) as (Teacher & { destinations: Destination[] })[]

  // Counted per role — see lib/roles/pairs.ts. The teacher rule (exact subject,
  // reciprocal provinces) lives in lib/roles/teacher.ts.
  const pairs = listMutualPairs(all)

  return Response.json({
    totalTeachers: all.length,
    teachersWithDestinations: all.filter((t) => t.destinations?.length).length,
    matchCount: pairs.length,
    pairs,
  })
}
