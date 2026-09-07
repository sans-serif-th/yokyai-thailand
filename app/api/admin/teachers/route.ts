import { createServiceClient } from '@/lib/supabase-server'
import { Teacher } from '@/lib/types'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')
  const source = url.searchParams.get('source')
  const subject = url.searchParams.get('subject')
  const originProvince = url.searchParams.get('origin_province')
  const destinationProvince = url.searchParams.get('destination_province')

  // Simple token validation (check if it's a valid admin token)
  if (!token || !token.startsWith('admin:')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  let query = supabase.from('teachers').select(`
    *,
    destinations (*)
  `)

  if (source) {
    query = query.eq('source', source)
  }

  if (subject) {
    query = query.eq('subject', subject)
  }

  if (originProvince) {
    query = query.eq('origin_province', originProvince)
  }

  const { data, error } = await query

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  let filtered = data || []

  // Filter by destination province if provided
  if (destinationProvince) {
    filtered = filtered.filter((t) =>
      t.destinations?.some((d: any) => d.province === destinationProvince)
    )
  }

  return Response.json(filtered)
}
