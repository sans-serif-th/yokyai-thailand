import { checkAdminToken } from '@/lib/admin-token'
import { validateRoundInput } from '@/lib/rounds'
import { createServiceClient } from '@/lib/supabase-server'

type Params = { params: Promise<{ id: string }> }

// Edit a round's label/dates, and/or make it the role's active round
// (`is_active: true`; the role's previously active round is switched off).
export async function PATCH(request: Request, { params }: Params) {
  if (!checkAdminToken(new URL(request.url).searchParams.get('token'))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const body = await request.json().catch(() => ({}))

  const supabase = createServiceClient()
  const { data: round, error: loadError } = await supabase
    .from('rounds')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (loadError) return Response.json({ error: loadError.message }, { status: 500 })
  if (!round) return Response.json({ error: 'Round not found' }, { status: 404 })

  const next = {
    label: typeof body.label === 'string' ? body.label.trim() : round.label,
    matching_opens_at:
      body.matching_opens_at !== undefined ? body.matching_opens_at : round.matching_opens_at,
    matching_closes_at:
      body.matching_closes_at !== undefined ? body.matching_closes_at : round.matching_closes_at,
    registration_opens_at:
      body.registration_opens_at !== undefined ? body.registration_opens_at : round.registration_opens_at,
    registration_closes_at:
      body.registration_closes_at !== undefined ? body.registration_closes_at : round.registration_closes_at,
  }
  const invalid = validateRoundInput(next)
  if (invalid) return Response.json({ error: invalid }, { status: 400 })

  if (body.is_active === false && round.is_active) {
    return Response.json({ error: 'เลือกรอบอื่นเป็นรอบที่ใช้งานแทน' }, { status: 400 })
  }
  if (body.is_active === true && !round.is_active) {
    // Free the role's single active slot first (partial unique index).
    const { error: offError } = await supabase
      .from('rounds')
      .update({ is_active: false })
      .eq('category', round.category)
      .eq('is_active', true)
    if (offError) return Response.json({ error: offError.message }, { status: 500 })
  }

  const { data, error } = await supabase
    .from('rounds')
    .update({ ...next, ...(body.is_active === true ? { is_active: true } : {}) })
    .eq('id', id)
    .select()
    .single()
  if (error) {
    const duplicate = error.code === '23505'
    return Response.json(
      { error: duplicate ? 'มีรอบชื่อนี้ใน role นี้อยู่แล้ว' : error.message },
      { status: duplicate ? 409 : 500 }
    )
  }
  return Response.json(data)
}

// Only inactive rounds with no payment subscriptions can be deleted.
export async function DELETE(request: Request, { params }: Params) {
  if (!checkAdminToken(new URL(request.url).searchParams.get('token'))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const supabase = createServiceClient()

  const { data: round } = await supabase.from('rounds').select('is_active').eq('id', id).maybeSingle()
  if (!round) return Response.json({ error: 'Round not found' }, { status: 404 })
  if (round.is_active) return Response.json({ error: 'ลบรอบที่ใช้งานอยู่ไม่ได้' }, { status: 400 })

  const { count, error: countError } = await supabase
    .from('round_subscriptions')
    .select('id', { count: 'exact', head: true })
    .eq('round_id', id)
  if (countError) return Response.json({ error: countError.message }, { status: 500 })
  if (count) return Response.json({ error: 'รอบนี้มีข้อมูลแพ็กเกจแล้ว ลบไม่ได้' }, { status: 400 })

  const { error } = await supabase.from('rounds').delete().eq('id', id)
  if (error) {
    // favorites.round_id has no on-delete clause.
    return Response.json({ error: error.code === '23503' ? 'รอบนี้ถูกอ้างอิงอยู่ ลบไม่ได้' : error.message }, { status: 400 })
  }
  return Response.json({ ok: true })
}
