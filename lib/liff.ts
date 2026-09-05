'use client'

import liff from '@line/liff'

let initPromise: Promise<void> | null = null

// Idempotent LIFF init — safe to call from multiple components; they all
// await the same underlying liff.init() call.
export function initLiff(): Promise<void> {
  if (!initPromise) {
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID
    if (!liffId) {
      throw new Error('Missing NEXT_PUBLIC_LIFF_ID environment variable')
    }
    initPromise = liff.init({ liffId }).then(() => {
      if (!liff.isLoggedIn()) {
        liff.login()
      }
    })
  }
  return initPromise
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
