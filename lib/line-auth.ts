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

export async function verifyLineIdToken(idToken: string): Promise<LineVerifyResponse> {
  const channelId = process.env.LINE_CHANNEL_ID ?? process.env.CHANNEL_ID
  if (!channelId) {
    throw new Error('Missing LINE_CHANNEL_ID (or CHANNEL_ID) environment variable')
  }
  if (!idToken) {
    throw new LineAuthError('Missing ID token')
  }

  const res = await fetch('https://api.line.me/oauth2/v2.1/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ id_token: idToken, client_id: channelId }),
  })

  if (!res.ok) {
    throw new LineAuthError(`LINE token verification failed: ${res.status}`)
  }

  return (await res.json()) as LineVerifyResponse
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
