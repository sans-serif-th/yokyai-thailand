import { getActiveRound } from '@/lib/rounds'
import { createServiceClient } from '@/lib/supabase-server'

function checkAdminToken(token: string | null): boolean {
  if (!token) return false
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    return decoded.startsWith('admin:')
  } catch {
    return false
  }
}

// Admin view/control of the active round's registration/matching-phase
// gate (see lib/rounds.ts, isRoundInMatchingPhase). Deliberately minimal —
// this only ever edits matching_opens_at on the one already-active round;
// creating/activating rounds themselves stays a manual SQL step.
export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')

  if (!checkAdminToken(token)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const round = await getActiveRound()
  if (!round) {
    return Response.json({ error: 'No active round configured' }, { status: 404 })
  }
  return Response.json(round)
}

export async function PATCH(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')

  if (!checkAdminToken(token)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  if (body.matching_opens_at !== null) {
    const parsed = new Date(body.matching_opens_at)
    if (typeof body.matching_opens_at !== 'string' || Number.isNaN(parsed.getTime())) {
      return Response.json({ error: 'Invalid matching_opens_at' }, { status: 400 })
    }
  }

  const round = await getActiveRound()
  if (!round) {
    return Response.json({ error: 'No active round configured' }, { status: 404 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('rounds')
    .update({ matching_opens_at: body.matching_opens_at })
    .eq('id', round.id)
    .select()
    .single()

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
  return Response.json(data)
}
