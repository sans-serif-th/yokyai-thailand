import { createServiceClient } from '@/lib/supabase-server'
import type { AdminStatus } from '@/lib/types'
import { checkAdminToken } from '@/lib/admin-token'
import { hasRoleImplementation } from '@/lib/roles'
import { getRoleFields } from '@/lib/roles/field-registry'
import { adminEditableFields, validateFieldValue } from '@/lib/roles/fields'

const ADMIN_STATUSES: AdminStatus[] = ['new', 'contacted', 'follow_up', 'closed']

// Columns every role shares; a role's own editable columns come from its
// field definitions (lib/roles).
const CORE_EDITABLE_COLUMNS = ['facebook_url', 'category', 'admin_status']

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const url = new URL(request.url)
  const token = url.searchParams.get('token')

  if (!checkAdminToken(token)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const supabase = createServiceClient()

  const { data: current, error: currentError } = await supabase
    .from('teachers')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (currentError) return Response.json({ error: currentError.message }, { status: 500 })
  if (!current) return Response.json({ error: 'Not found' }, { status: 404 })

  // Validate against the role the row will have after this edit.
  const fields = adminEditableFields(getRoleFields(body.category ?? current.category))
  const update: Record<string, unknown> = {}
  for (const column of CORE_EDITABLE_COLUMNS) {
    if (column in body) update[column] = body[column]
  }
  for (const field of fields) {
    if (!(field.column in body)) continue
    const value = body[field.column]
    // Legacy values (e.g. old Facebook imports) the admin didn't touch are
    // saved back unchanged rather than rejected.
    if (value !== current[field.column] && !validateFieldValue(field, value)) {
      return Response.json({ error: `Invalid value for ${field.label}` }, { status: 400 })
    }
    update[field.column] = value
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
