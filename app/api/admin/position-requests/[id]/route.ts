import { checkAdminToken } from '@/lib/admin-token'
import { createServiceClient } from '@/lib/supabase-server'

// Mark a request handled ({ handled: true }) or open again ({ handled: false }).
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAdminToken(new URL(request.url).searchParams.get('token'))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params

  const body = await request.json().catch(() => null)
  if (typeof body?.handled !== 'boolean') {
    return Response.json({ error: 'handled must be true or false' }, { status: 400 })
  }

  const { data, error } = await createServiceClient()
    .from('position_requests')
    .update({ handled_at: body.handled ? new Date().toISOString() : null })
    .eq('id', id)
    .select('id')
    .maybeSingle()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  if (!data) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json({ success: true })
}
