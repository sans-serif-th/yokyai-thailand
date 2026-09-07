import { createServiceClient } from '@/lib/supabase-server'

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

  // Get all unclaimed seeds (facebook_import, claimed_at IS NULL)
  const { data: unclaimed, error: unclaimedError } = await supabase
    .from('teachers')
    .select(`
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
    `)
    .eq('source', 'facebook_import')
    .is('claimed_at', null)

  if (unclaimedError) {
    return Response.json({ error: unclaimedError.message }, { status: 500 })
  }

  // For each unclaimed seed, find potential matches (claimed real users)
  const potentialMatches = []

  for (const seed of unclaimed || []) {
    const { data: matches, error: matchError } = await supabase
      .from('teachers')
      .select(`
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
      `)
      .eq('position', seed.position)
      .eq('service_type', seed.service_type)
      .eq('source', 'app')
      .not('claimed_at', 'is', null)

    if (matchError) continue

    // Find matches where:
    // - Real user wants to go to seed's origin province
    // - Seed wants to go to real user's origin province
    for (const realUser of matches || []) {
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
