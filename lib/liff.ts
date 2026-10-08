'use client'

import liff from '@line/liff'

function requireLiffId(): string {
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID
  if (!liffId) {
    throw new Error('Missing NEXT_PUBLIC_LIFF_ID environment variable')
  }
  return liffId
}

let initPromise: Promise<void> | null = null

// Idempotent LIFF init — safe to call from multiple components; they all
// await the same underlying liff.init() call. Auto-redirects to LINE login
// if not already logged in, so callers can assume a logged-in session once
// this resolves.
export function initLiff(): Promise<void> {
  if (!initPromise) {
    initPromise = liff.init({ liffId: requireLiffId() }).then(() => {
      if (!liff.isLoggedIn()) {
        liff.login()
        // login() redirects away; never resolve, so callers don't go on to
        // read a (missing) ID token and flash an error during the redirect.
        return new Promise<void>(() => {})
      }
    })
  }
  return initPromise
}

// For the logged-out screen only: initializes the SDK WITHOUT forcing
// liff.login() — needed so the page can render its own "log back in" button
// instead of being immediately redirected away.
let initPlainPromise: Promise<void> | null = null
export function initLiffPlain(): Promise<void> {
  if (!initPlainPromise) {
    initPlainPromise = liff.init({ liffId: requireLiffId() })
  }
  return initPlainPromise
}

// Call after initLiff() resolves. Returns the ID token to send as
// `Authorization: Bearer <token>` on API requests — see lib/line-auth.ts.
export function getLiffIdToken(): string {
  const token = liff.getIDToken()
  if (!token) {
    throw new Error('No LIFF ID token available — is the user logged in?')
  }
  return token
}

// True if the cached ID token is within 60s of its `exp`. LINE's
// ID token expires (~1h) independently of the LIFF login session, so a
// returning user is "logged in" yet holds a dead token.
export function isIdTokenExpired(): boolean {
  const decoded = liff.getDecodedIDToken()
  // Can't tell -> let the server decide, rather than risk a re-login loop.
  if (!decoded?.exp) return false
  return decoded.exp * 1000 - Date.now() < 60_000
}

export function isLiffLoggedIn(): boolean {
  return liff.isLoggedIn()
}

export function liffLogin(): void {
  liff.login()
}

export function liffLogout(): void {
  liff.logout()
}

export function getLiffProfile() {
  return liff.getProfile()
}
