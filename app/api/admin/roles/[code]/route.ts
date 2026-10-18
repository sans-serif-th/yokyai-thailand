import { checkAdminToken } from '@/lib/admin-token'
import { hasRoleImplementation } from '@/lib/roles'
import { checkDelete, checkStatusChange, ROLE_STATUSES } from '@/lib/roles/admin-rules'
import { listRoles } from '@/lib/roles/server'
import { createServiceClient } from '@/lib/supabase-server'
import type { RoleStatus } from '@/lib/types'

type Params = { params: Promise<{ code: string }> }

export async function PATCH(request: Request, { params }: Params) {
  if (!checkAdminToken(new URL(request.url).searchParams.get('token'))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { code } = await params
  const body = await request.json().catch(() => ({}))

  const update: Record<string, unknown> = {}
  if (body.name_th !== undefined) {
    if (typeof body.name_th !== 'string' || !body.name_th.trim()) {
      return Response.json({ error: 'Thai name is required' }, { status: 400 })
    }
    update.name_th = body.name_th.trim()
  }
  if (body.name_en !== undefined) {
    if (typeof body.name_en !== 'string' || !body.name_en.trim()) {
      return Response.json({ error: 'English name is required' }, { status: 400 })
    }
    update.name_en = body.name_en.trim()
  }
  if (body.sort_order !== undefined) {
    if (!Number.isInteger(body.sort_order)) {
      return Response.json({ error: 'Order must be a whole number' }, { status: 400 })
    }
    update.sort_order = body.sort_order
  }
  if (body.status !== undefined) {
    if (!ROLE_STATUSES.includes(body.status)) {
      return Response.json({ error: 'Invalid status' }, { status: 400 })
    }
    const roles = await listRoles()
    const rule = checkStatusChange(roles, code, body.status as RoleStatus, hasRoleImplementation(code))
    if (!rule.ok) return Response.json({ error: rule.error }, { status: 400 })
    update.status = body.status
  }
  if (Object.keys(update).length === 0) {
    return Response.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('categories')
    .update(update)
    .eq('code', code)
    .select('code, name_th, name_en, status, sort_order')
    .maybeSingle()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  if (!data) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json(data)
}

export async function DELETE(request: Request, { params }: Params) {
  if (!checkAdminToken(new URL(request.url).searchParams.get('token'))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { code } = await params

  const supabase = createServiceClient()
  const { count, error: countError } = await supabase
    .from('teachers')
    .select('id', { count: 'exact', head: true })
    .eq('category', code)
  if (countError) return Response.json({ error: countError.message }, { status: 500 })

  const rule = checkDelete({ code }, count ?? 0)
  if (!rule.ok) return Response.json({ error: rule.error }, { status: 400 })

  const { error } = await supabase.from('categories').delete().eq('code', code)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true })
}
