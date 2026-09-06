import type { Destination, MatchResult, ProfilePayload, Teacher } from './types'

// Carries the HTTP status so callers can distinguish "the LINE ID token
// expired" (401 — recoverable by re-authenticating, see lib/session.ts)
// from any other failure.
export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function authedFetch(path: string, idToken: string, init?: RequestInit) {
  const res = await fetch(path, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${idToken}`,
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    },
  })
  const body = await res.json()
  if (!res.ok) throw new ApiError(res.status, body.error ?? `Request failed (${res.status})`)
  return body
}

export async function fetchProfile(
  idToken: string
): Promise<{ teacher: Teacher | null; destinations: Destination[] }> {
  return authedFetch('/api/teachers', idToken)
}

export async function saveProfile(
  idToken: string,
  payload: ProfilePayload
): Promise<{ teacher: Teacher }> {
  return authedFetch('/api/teachers', idToken, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function fetchMatches(idToken: string): Promise<{ matches: MatchResult[] }> {
  return authedFetch('/api/matches', idToken)
}

export async function fetchFavorites(idToken: string): Promise<{ matches: MatchResult[] }> {
  return authedFetch('/api/favorites', idToken)
}

export async function addFavorite(idToken: string, teacherId: string): Promise<void> {
  await authedFetch('/api/favorites', idToken, {
    method: 'POST',
    body: JSON.stringify({ teacherId }),
  })
}

export async function removeFavorite(idToken: string, teacherId: string): Promise<void> {
  await authedFetch('/api/favorites', idToken, {
    method: 'DELETE',
    body: JSON.stringify({ teacherId }),
  })
}
