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

// Releases the next `count` earliest-registered (created_at ASC) still-
// queued teachers — the batched-rollout mechanism the "All Teachers" tab's
// queue controls drive. Only touches rows where queue_released_at is null;
// already-released rows are untouched (idempotent to call again).
export async function POST(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')

  if (!checkAdminToken(token)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const count = Number(body.count)
  if (!Number.isInteger(count) || count <= 0) {
    return Response.json({ error: 'Invalid count' }, { status: 400 })
  }

  const supabase = createServiceClient()

  const { data: candidates, error: selectError } = await supabase
    .from('teachers')
    .select('id')
    .is('queue_released_at', null)
    .order('created_at', { ascending: true })
    .limit(count)

  if (selectError) {
    return Response.json({ error: selectError.message }, { status: 500 })
  }
  if (!candidates?.length) {
    return Response.json({ released: [] })
  }

  const ids = candidates.map((c) => c.id)
  const { data: released, error: updateError } = await supabase
    .from('teachers')
    .update({ queue_released_at: new Date().toISOString() })
    .in('id', ids)
    .select(`*, destinations (*)`)

  if (updateError) {
    return Response.json({ error: updateError.message }, { status: 500 })
  }

  return Response.json({ released })
}
