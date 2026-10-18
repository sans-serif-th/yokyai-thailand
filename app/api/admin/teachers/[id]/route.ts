import { createServiceClient } from '@/lib/supabase-server'
import type { AdminStatus } from '@/lib/types'
import { checkAdminToken } from '@/lib/admin-token'
import { hasRoleImplementation } from '@/lib/roles'

const ADMIN_STATUSES: AdminStatus[] = ['new', 'contacted', 'follow_up', 'closed']

const EDITABLE_FIELDS = [
  'display_name',
  'position',
  'service_type',
  'origin_province',
  'origin_district',
  'origin_zone',
  'current_school',
  'teaching_group',
  'subject',
  'benefit_note',
  'transfer_round',
  'transfer_year',
  'facebook_url',
  'phone',
  'category',
  'admin_status',
] as const

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const url = new URL(request.url)
  const token = url.searchParams.get('token')

  if (!checkAdminToken(token)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const update: Record<string, unknown> = {}
  for (const field of EDITABLE_FIELDS) {
    if (field in body) update[field] = body[field]
  }

  if (Object.keys(update).length === 0) {
    return Response.json({ error: 'No editable fields provided' }, { status: 400 })
  }

  if ('admin_status' in update && !ADMIN_STATUSES.includes(update.admin_status as AdminStatus)) {
    return Response.json({ error: 'Invalid admin_status' }, { status: 400 })
  }

  // Moving a user to a role with no code behind it would break their matching
  // and profile edits (lib/roles).
  if ('category' in update && !hasRoleImplementation(String(update.category))) {
    return Response.json({ error: 'That role has no implementation yet' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('teachers')
    .update(update)
    .eq('id', id)
    .select(`*, destinations (*)`)
    .single()

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const url = new URL(request.url)
  const token = url.searchParams.get('token')

  if (!checkAdminToken(token)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { error } = await supabase.from('teachers').delete().eq('id', id)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ success: true })
}
