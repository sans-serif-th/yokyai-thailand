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

// Unlike subjects, teaching_group codes are also a fixed TypeScript union
// (TeachingGroupCode in lib/teaching-groups.ts) used by user-facing forms
// (profile-edit-form, criteria-form, etc.), which render their dropdown
// options from that hardcoded list, not this table. Adding a row here seeds
// the reference table for a future group, but it won't appear to real users
// until lib/teaching-groups.ts is updated and redeployed to match.
export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')

  if (!checkAdminToken(token)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase.from('teaching_groups').select('*').order('code')

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

  const { code, name_th, name_en } = await request.json()
  if (!code || !name_th || !name_en) {
    return Response.json({ error: 'code, name_th and name_en are required' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('teaching_groups')
    .insert({ code, name_th, name_en })
    .select()
    .single()

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data)
}
