// Server-side verification of a LINE LIFF ID token.
//
// The client obtains an ID token via `liff.getIDToken()` (see lib/liff.ts)
// and sends it with every API request. We never trust a line_user_id the
// client claims directly — it must come from a token LINE itself verifies.
//
// https://developers.line.biz/en/reference/line-login/#verify-id-token

interface LineVerifyResponse {
  iss: string
  sub: string // LINE user id — this is our line_user_id
  aud: string
  exp: number
  iat: number
  name?: string
  picture?: string
}

export class LineAuthError extends Error {}

// A page load fires off several API calls (teachers, matches, subscription,
// favorites) that each carry the same ID token — without this, every one of
// them independently round-trips to LINE's verify endpoint before any of our
// own data loads, which is the main source of "the app feels slow to load".
// Keyed by the raw token string, so a refreshed token (new value) always
// gets re-verified for real.
//
// In-memory only: on Vercel this cache lives per warm serverless instance,
// so it helps the common case (several requests from one page load hitting
// the same warm instance back-to-back) without needing an external store.
// Capped well under the token's own expiry so we never trust a cached
// result past when LINE itself would've rejected the token.
const VERIFY_CACHE_TTL_MS = 60_000
const verifyCache = new Map<string, { result: LineVerifyResponse; cachedUntil: number }>()

function pruneExpiredCacheEntries(now: number) {
  for (const [token, entry] of verifyCache) {
    if (entry.cachedUntil <= now) verifyCache.delete(token)
  }
}

export async function verifyLineIdToken(idToken: string): Promise<LineVerifyResponse> {
  const channelId = process.env.LINE_CHANNEL_ID ?? process.env.CHANNEL_ID
  if (!channelId) {
    throw new Error('Missing LINE_CHANNEL_ID (or CHANNEL_ID) environment variable')
  }
  if (!idToken) {
    throw new LineAuthError('Missing ID token')
  }

  const now = Date.now()
  const cached = verifyCache.get(idToken)
  if (cached && cached.cachedUntil > now) {
    return cached.result
  }

  const res = await fetch('https://api.line.me/oauth2/v2.1/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ id_token: idToken, client_id: channelId }),
  })

  if (!res.ok) {
    const body = await res.text()
    verifyCache.delete(idToken)
    throw new LineAuthError(`LINE token verification failed: ${res.status} ${body}`)
  }

  const result = (await res.json()) as LineVerifyResponse
  // Never cache past the token's own expiry (exp is in seconds; Date.now() in ms).
  const cachedUntil = Math.min(now + VERIFY_CACHE_TTL_MS, result.exp * 1000)
  pruneExpiredCacheEntries(now)
  verifyCache.set(idToken, { result, cachedUntil })
  return result
}

// Extracts and verifies the ID token from an Authorization: Bearer header.
export async function verifyRequestAuth(request: Request): Promise<LineVerifyResponse> {
  const header = request.headers.get('authorization')
  const idToken = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null
  if (!idToken) {
    throw new LineAuthError('Missing Authorization: Bearer <idToken> header')
  }
  return verifyLineIdToken(idToken)
}
