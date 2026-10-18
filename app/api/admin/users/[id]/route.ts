import { hashPassword, MIN_PASSWORD_LENGTH } from '@/lib/admin-password'
import { getAdminUsername } from '@/lib/admin-token'
import { createServiceClient } from '@/lib/supabase-server'

// Change another admin's (or your own) password.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!getAdminUsername(new URL(request.url).searchParams.get('token'))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params

  const body = await request.json().catch(() => null)
  const password = typeof body?.password === 'string' ? body.password : ''
  if (password.length < MIN_PASSWORD_LENGTH) {
    return Response.json(
      { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
      { status: 400 },
    )
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('admin_users')
    .update({ password_hash: await hashPassword(password) })
    .eq('id', id)
    .select('id')
    .maybeSingle()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  if (!data) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json({ success: true })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = getAdminUsername(new URL(request.url).searchParams.get('token'))
  if (!me) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const supabase = createServiceClient()
  const { data: target } = await supabase
    .from('admin_users')
    .select('id, username')
    .eq('id', id)
    .maybeSingle()
  if (!target) return Response.json({ error: 'Not found' }, { status: 404 })
  if (target.username === me) {
    return Response.json({ error: 'You cannot delete your own account' }, { status: 400 })
  }

  const { error } = await supabase.from('admin_users').delete().eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true })
}
