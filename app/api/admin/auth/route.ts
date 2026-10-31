import { DUMMY_HASH, verifyPassword } from '@/lib/admin-password'
import { signAdminToken } from '@/lib/admin-token'
import {
  ADMIN_LOGIN_LIMITS,
  clearFailedAdminLogins,
  clientIp,
  isAdminLoginBlocked,
  recordFailedAdminLogin,
} from '@/lib/rate-limit'
import { createServiceClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const username = typeof body?.username === 'string' ? body.username.trim().toLowerCase() : ''
  const password = typeof body?.password === 'string' ? body.password : ''

  // Too many wrong passwords from this address: refuse before doing any work.
  const ip = clientIp(request)
  // If the attempts table can't be read the login still works (and is logged):
  // locking every admin out is worse than skipping the throttle.
  const blocked = await isAdminLoginBlocked(username, ip).catch((err) => {
    console.error('admin login throttle unavailable', err)
    return false
  })
  if (blocked) {
    return Response.json(
      { error: 'Too many attempts. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(ADMIN_LOGIN_LIMITS.windowMinutes * 60) } }
    )
  }

  const supabase = createServiceClient()
  const { data } = await supabase
    .from('admin_users')
    .select('username, password_hash')
    .eq('username', username)
    .maybeSingle()

  // Always run one scrypt verification so a missing user isn't detectable by timing.
  const ok = await verifyPassword(password, data?.password_hash ?? DUMMY_HASH)
  if (!data || !ok) {
    await recordFailedAdminLogin(username, ip)
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await clearFailedAdminLogins(username, ip)
  const token = signAdminToken(data.username)
  if (!token) {
    console.error('ADMIN_TOKEN_SECRET is not set')
    return Response.json({ error: 'Admin login is not configured' }, { status: 500 })
  }

  return Response.json({ token, username: data.username, success: true })
}
