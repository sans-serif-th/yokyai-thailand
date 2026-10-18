import { createServiceClient } from '@/lib/supabase-server'
import { checkAdminToken } from '@/lib/admin-token'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')

  if (!checkAdminToken(token)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .order('teaching_group')
    .order('name_th')

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data)
}

export async function POST(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')

  if (!checkAdminToken(token)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { teaching_group, name_th } = await request.json()
  if (!teaching_group || !name_th) {
    return Response.json({ error: 'teaching_group and name_th are required' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('subjects')
    .insert({ teaching_group, name_th })
    .select()
    .single()

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data)
}
