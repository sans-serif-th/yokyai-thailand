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
      }
    })
  }
  return initPromise
}

// The LINE ID token has its own short expiry, separate from the LIFF login
// session — liff.init() does not refresh it on its own once cached here.
// Called when the backend reports the token expired (see lib/session.ts's
// withAuthRetry), so the next initLiff() re-establishes the session and
// mints a fresh token.
export function resetLiffInit(): void {
  initPromise = null
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
