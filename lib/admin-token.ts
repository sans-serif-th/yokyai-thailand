import { createHmac, timingSafeEqual } from 'node:crypto'

// Admin sessions are signed tokens minted by app/api/admin/auth/route.ts and
// sent as ?token=. Format: "<base64url payload>.<base64url HMAC-SHA256>" where
// the payload is {u: username, exp: unix seconds}. Requires ADMIN_TOKEN_SECRET;
// without it every check fails closed.
const TOKEN_TTL_SECONDS = 12 * 60 * 60

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

export function signAdminToken(username: string): string | null {
  const secret = process.env.ADMIN_TOKEN_SECRET
  if (!secret) return null
  const payload = Buffer.from(
    JSON.stringify({ u: username, exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS }),
  ).toString('base64url')
  return `${payload}.${sign(payload, secret)}`
}

// Returns the username the token was minted for, or null if it is missing,
// forged or expired.
export function getAdminUsername(token: string | null): string | null {
  const secret = process.env.ADMIN_TOKEN_SECRET
  if (!token || !secret) return null
  const [payload, signature, ...rest] = token.split('.')
  if (!payload || !signature || rest.length > 0) return null

  const expected = Buffer.from(sign(payload, secret))
  const actual = Buffer.from(signature)
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null

  try {
    const { u, exp } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'))
    if (typeof u !== 'string' || typeof exp !== 'number') return null
    return exp > Date.now() / 1000 ? u : null
  } catch {
    return null
  }
}

export function checkAdminToken(token: string | null): boolean {
  return getAdminUsername(token) !== null
}
