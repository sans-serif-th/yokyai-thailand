import type { Destination, MatchResult, ProfilePayload, Teacher } from './types'

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
  if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`)
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
