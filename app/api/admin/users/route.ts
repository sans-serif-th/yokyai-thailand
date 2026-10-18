import { hashPassword, MIN_PASSWORD_LENGTH, USERNAME_PATTERN } from '@/lib/admin-password'
import { checkAdminToken } from '@/lib/admin-token'
import { createServiceClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  if (!checkAdminToken(new URL(request.url).searchParams.get('token'))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('admin_users')
    .select('id, username, created_at')
    .order('created_at')
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function POST(request: Request) {
  if (!checkAdminToken(new URL(request.url).searchParams.get('token'))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const username = typeof body?.username === 'string' ? body.username.trim().toLowerCase() : ''
  const password = typeof body?.password === 'string' ? body.password : ''
  if (!USERNAME_PATTERN.test(username)) {
    return Response.json(
      { error: 'Username must be 3-32 characters: a-z, 0-9, dot, underscore or dash' },
      { status: 400 },
    )
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return Response.json(
      { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
      { status: 400 },
    )
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('admin_users')
    .insert({ username, password_hash: await hashPassword(password) })
    .select('id, username, created_at')
    .single()
  if (error) {
    const status = error.code === '23505' ? 409 : 500
    return Response.json(
      { error: status === 409 ? 'Username already exists' : error.message },
      { status },
    )
  }
  return Response.json(data, { status: 201 })
}
