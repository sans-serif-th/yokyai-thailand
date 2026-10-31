import { createServiceClient } from './supabase-server'

// Spam / brute-force limits. Counted in the database (not in memory), since
// serverless requests are spread over instances that share no memory.

export const ADMIN_LOGIN_LIMITS = {
  windowMinutes: 15,
  // Failed attempts for one username from one address.
  perUsernameAndIp: 5,
  // Failed attempts from one address whatever username it tries.
  perIp: 20,
} as const

// Tying the lock to the address as well as the username means a stranger
// guessing an admin's username cannot lock that admin out from elsewhere.
export function isLoginBlocked(counts: { usernameAndIp: number; ip: number }): boolean {
  return counts.usernameAndIp >= ADMIN_LOGIN_LIMITS.perUsernameAndIp || counts.ip >= ADMIN_LOGIN_LIMITS.perIp
}

export const POSITION_REQUEST_LIMIT = { perDay: 5 } as const

export function isOverPositionRequestLimit(sentToday: number): boolean {
  return sentToday >= POSITION_REQUEST_LIMIT.perDay
}

// First address in x-forwarded-for (Vercel puts the client's there).
export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || request.headers.get('x-real-ip') || 'unknown'
}

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString()

export async function isAdminLoginBlocked(username: string, ip: string): Promise<boolean> {
  const supabase = createServiceClient()
  const since = minutesAgo(ADMIN_LOGIN_LIMITS.windowMinutes)
  const [byIp, byBoth] = await Promise.all([
    supabase.from('admin_login_attempts').select('id', { count: 'exact', head: true }).eq('ip', ip).gte('created_at', since),
    supabase
      .from('admin_login_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('ip', ip)
      .eq('username', username)
      .gte('created_at', since),
  ])
  if (byIp.error) throw byIp.error
  if (byBoth.error) throw byBoth.error
  return isLoginBlocked({ ip: byIp.count ?? 0, usernameAndIp: byBoth.count ?? 0 })
}

export async function recordFailedAdminLogin(username: string, ip: string): Promise<void> {
  const supabase = createServiceClient()
  await supabase.from('admin_login_attempts').insert({ username, ip })
  // Housekeeping: nothing older than a day is ever counted.
  await supabase.from('admin_login_attempts').delete().lt('created_at', minutesAgo(24 * 60))
}

export async function clearFailedAdminLogins(username: string, ip: string): Promise<void> {
  await createServiceClient().from('admin_login_attempts').delete().eq('ip', ip).eq('username', username)
}

export async function positionRequestsSentToday(lineUserId: string): Promise<number> {
  const { count, error } = await createServiceClient()
    .from('position_requests')
    .select('id', { count: 'exact', head: true })
    .eq('line_user_id', lineUserId)
    .gte('created_at', minutesAgo(24 * 60))
  if (error) throw error
  return count ?? 0
}
