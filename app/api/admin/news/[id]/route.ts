import { checkAdminToken } from '@/lib/admin-token'
import { isNewsId, newsPayloadToRow, validateNewsPayload } from '@/lib/news'
import { createServiceClient } from '@/lib/supabase-server'

type Ctx = { params: Promise<{ id: string }> }

// The admin form always sends the whole item, so PATCH replaces every field.
export async function PATCH(request: Request, { params }: Ctx) {
  if (!checkAdminToken(new URL(request.url).searchParams.get('token'))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  if (!isNewsId(id)) return Response.json({ error: 'Not found' }, { status: 404 })

  const body = await request.json()
  if (!validateNewsPayload(body)) {
    return Response.json({ error: 'Invalid news payload' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('news')
    .update(newsPayloadToRow(body))
    .eq('id', id)
    .select()
    .maybeSingle()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  if (!data) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json(data)
}

export async function DELETE(request: Request, { params }: Ctx) {
  if (!checkAdminToken(new URL(request.url).searchParams.get('token'))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  if (!isNewsId(id)) return Response.json({ error: 'Not found' }, { status: 404 })

  const supabase = createServiceClient()
  const { error } = await supabase.from('news').delete().eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true })
}
