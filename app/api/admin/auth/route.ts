import { DUMMY_HASH, verifyPassword } from '@/lib/admin-password'
import { signAdminToken } from '@/lib/admin-token'
import { createServiceClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const username = typeof body?.username === 'string' ? body.username.trim().toLowerCase() : ''
  const password = typeof body?.password === 'string' ? body.password : ''

  const supabase = createServiceClient()
  const { data } = await supabase
    .from('admin_users')
    .select('username, password_hash')
    .eq('username', username)
    .maybeSingle()

  // Always run one scrypt verification so a missing user isn't detectable by timing.
  const ok = await verifyPassword(password, data?.password_hash ?? DUMMY_HASH)
  if (!data || !ok) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = signAdminToken(data.username)
  if (!token) {
    console.error('ADMIN_TOKEN_SECRET is not set')
    return Response.json({ error: 'Admin login is not configured' }, { status: 500 })
  }

  return Response.json({ token, username: data.username, success: true })
}
