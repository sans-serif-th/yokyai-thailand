import { checkAdminToken } from '@/lib/admin-token'
import { newsPayloadToRow, validateNewsPayload } from '@/lib/news'
import { createServiceClient } from '@/lib/supabase-server'

// All news, including unpublished drafts, for /admin/news.
export async function GET(request: Request) {
  if (!checkAdminToken(new URL(request.url).searchParams.get('token'))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('published_date', { ascending: false })
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function POST(request: Request) {
  if (!checkAdminToken(new URL(request.url).searchParams.get('token'))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  if (!validateNewsPayload(body)) {
    return Response.json({ error: 'Invalid news payload' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase.from('news').insert(newsPayloadToRow(body)).select().single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
