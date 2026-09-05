import { ApiError } from './api'
import { getLiffIdToken, initLiff, resetLiffInit } from './liff'

// Runs `run` with a valid LIFF ID token. If the backend rejects the token as
// expired (401), re-establishes the LIFF session once and retries — see
// resetLiffInit()'s doc comment for why this is necessary. Returns the token
// actually used, so callers can hold onto it for later requests (e.g. a save
// button clicked well after the initial page load).
export async function withAuthRetry<T>(
  run: (idToken: string) => Promise<T>
): Promise<{ token: string; result: T }> {
  await initLiff()
  let token = getLiffIdToken()
  try {
    return { token, result: await run(token) }
  } catch (err) {
    if (!(err instanceof ApiError) || err.status !== 401) throw err
    resetLiffInit()
    await initLiff()
    token = getLiffIdToken()
    return { token, result: await run(token) }
  }
}
