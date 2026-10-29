import { checkAdminToken } from '@/lib/admin-token'
import { validateRoundInput } from '@/lib/rounds'
import { createServiceClient } from '@/lib/supabase-server'

// Admin management of a role's rounds (see lib/rounds.ts). Each role has its
// own rounds; one of them can be active at a time (PATCH /[id] switches it).
function authorized(request: Request) {
  return checkAdminToken(new URL(request.url).searchParams.get('token'))
}

export async function GET(request: Request) {
  if (!authorized(request)) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const category = new URL(request.url).searchParams.get('category') ?? 'teacher'
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('rounds')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false })
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function POST(request: Request) {
  if (!authorized(request)) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const input = {
    label: typeof body.label === 'string' ? body.label.trim() : '',
    matching_opens_at: body.matching_opens_at ?? null,
    matching_closes_at: body.matching_closes_at ?? null,
    registration_opens_at: body.registration_opens_at ?? null,
    registration_closes_at: body.registration_closes_at ?? null,
  }
  const invalid = validateRoundInput(input)
  if (invalid) return Response.json({ error: invalid }, { status: 400 })

  const supabase = createServiceClient()
  const { data: role } = await supabase
    .from('categories')
    .select('code')
    .eq('code', body.category)
    .maybeSingle()
  if (!role) return Response.json({ error: 'Unknown role' }, { status: 400 })

  // New rounds start inactive; an admin switches to them explicitly.
  const { data, error } = await supabase
    .from('rounds')
    .insert({ ...input, category: role.code, is_active: false })
    .select()
    .single()
  if (error) {
    const duplicate = error.code === '23505'
    return Response.json(
      { error: duplicate ? 'มีรอบชื่อนี้ใน role นี้อยู่แล้ว' : error.message },
      { status: duplicate ? 409 : 500 }
    )
  }
  return Response.json(data, { status: 201 })
}
