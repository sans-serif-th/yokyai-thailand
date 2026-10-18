// The /admin pages authenticate with the token minted by
// app/api/admin/auth/route.ts (base64 of "admin:<timestamp>"), sent as
// ?token=. New admin routes share this check; the older routes still carry
// their own copy.
export function checkAdminToken(token: string | null): boolean {
  if (!token) return false
  try {
    return Buffer.from(token, 'base64').toString('utf-8').startsWith('admin:')
  } catch {
    return false
  }
}
