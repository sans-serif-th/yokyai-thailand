import { ApiError } from './api'
import { getLiffIdToken, initLiff, isIdTokenExpired, liffLogin, liffLogout } from './liff'

// Several callers (page + bottom nav) can hit an expired token at once;
// only the first may start the logout/login cycle, or the user is sent
// through LINE login twice.
let reauthStarted = false

function reauthenticate(): Promise<never> {
  if (!reauthStarted) {
    reauthStarted = true
    liffLogout()
    liffLogin()
  }
  return new Promise<never>(() => {})
}

// Runs `run` with a valid LIFF ID token. If the backend rejects it as
// expired (401), forces a fresh login — see the comment below for why a
// plain retry can never work here. Returns the token actually used, so
// callers can hold onto it for later requests (e.g. a save button clicked
// well after the initial page load).
export async function withAuthRetry<T>(
  run: (idToken: string) => Promise<T>
): Promise<{ token: string; result: T }> {
  await initLiff()
  // Re-login up front when the token is already dead, instead of sending a
  // request that is certain to 401 first.
  if (isIdTokenExpired()) return reauthenticate()
  const token = getLiffIdToken()
  try {
    return { token, result: await run(token) }
  } catch (err) {
    if (!(err instanceof ApiError) || err.status !== 401) throw err

    // The ID token has its own short expiry, independent of the LIFF login
    // session — liff.isLoggedIn() reflects the underlying access/refresh
    // tokens, which stay valid far longer. So once the ID token itself
    // expires, liff.init() and even an explicit liff.login() are no-ops
    // while isLoggedIn() is still true — simply "trying again" fetches the
    // exact same stale token. The only way to mint a fresh one is a full
    // logout + login cycle. login() redirects the browser, so nothing
    // after this call runs — the page reloads fresh once LINE redirects
    // back, with a brand new token.
    return reauthenticate()
  }
}
