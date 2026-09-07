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

// Unlike subjects, service_type codes ('primary'/'secondary'/'vocational')
// are a fixed union baked into matching logic (lib/service-types.ts,
// lib/matching.ts) — this endpoint only lets admins edit the Thai display
// labels (name_th/abbr_th), not add or remove codes.
export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')

  if (!checkAdminToken(token)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase.from('service_types').select('*').order('code')

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data)
}

export async function PATCH(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')

  if (!checkAdminToken(token)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { code, name_th, abbr_th } = await request.json()
  if (!code) {
    return Response.json({ error: 'code is required' }, { status: 400 })
  }

  const update: Record<string, unknown> = {}
  if (name_th !== undefined) update.name_th = name_th
  if (abbr_th !== undefined) update.abbr_th = abbr_th

  if (Object.keys(update).length === 0) {
    return Response.json({ error: 'No editable fields provided' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('service_types')
    .update(update)
    .eq('code', code)
    .select()
    .single()

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data)
}
