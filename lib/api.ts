import type {
  Destination,
  MatchResult,
  PlatformStats,
  ProfilePayload,
  RegistrationBreakdown,
  SubscriptionStatus,
  Teacher,
} from './types'

export interface InviteLookup {
  teacher: Teacher
  destinations: Destination[]
}

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

// Short-lived in-memory cache of GET responses. Every tab is a client page
// that refetches on mount, so without this each tab switch waits on a full
// network round-trip (several, in sequence) behind a bare "loading" text.
// Caching the promise also dedupes concurrent callers (e.g. the bottom nav
// and the page both asking for the round phase). Module state survives
// client-side navigation; mutations below clear the affected entries.
const CACHE_TTL_MS = 60_000
const cache = new Map<string, { at: number; value: Promise<unknown> }>()

function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.value as Promise<T>
  const value = load()
  cache.set(key, { at: Date.now(), value })
  // Never keep a failed request around — the next caller should retry.
  value.catch(() => {
    if (cache.get(key)?.value === value) cache.delete(key)
  })
  return value
}

export function invalidateCache(...prefixes: string[]) {
  for (const key of [...cache.keys()]) {
    if (prefixes.length === 0 || prefixes.some((p) => key.startsWith(p))) cache.delete(key)
  }
}

export async function fetchProfile(
  idToken: string
): Promise<{ teacher: Teacher | null; destinations: Destination[] }> {
  return cached('profile', () => authedFetch('/api/teachers', idToken))
}

export async function saveProfile(
  idToken: string,
  payload: ProfilePayload
): Promise<{ teacher: Teacher }> {
  const res = await authedFetch('/api/teachers', idToken, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  // Profile changes alter matches, stats and the registration breakdown too.
  invalidateCache()
  return res
}

export async function fetchMatches(idToken: string): Promise<{ matches: MatchResult[] }> {
  return cached('matches', () => authedFetch('/api/matches', idToken))
}

export async function fetchStats(idToken: string): Promise<PlatformStats> {
  return cached('stats', () => authedFetch('/api/stats', idToken))
}

export async function fetchRoundPhase(
  idToken: string
): Promise<{ inMatchingPhase: boolean; roundLabel: string | null }> {
  return cached('round-phase', () => authedFetch('/api/round-phase', idToken))
}

export async function fetchRegistrationBreakdown(idToken: string): Promise<RegistrationBreakdown> {
  return cached('breakdown', () => authedFetch('/api/registration-breakdown', idToken))
}

export async function fetchFavorites(idToken: string): Promise<{ matches: MatchResult[] }> {
  return cached('favorites', () => authedFetch('/api/favorites', idToken))
}

// Dev-only — see app/api/matches/dev/route.ts. 404s unless
// NEXT_PUBLIC_DEV_TOOLS=1 is set.
export async function fetchAllImportedForDev(idToken: string): Promise<{ matches: MatchResult[] }> {
  return authedFetch('/api/matches/dev', idToken)
}

export async function addFavorite(idToken: string, teacherId: string): Promise<void> {
  await authedFetch('/api/favorites', idToken, {
    method: 'POST',
    body: JSON.stringify({ teacherId }),
  })
  invalidateCache('favorites', 'matches')
}

export async function removeFavorite(idToken: string, teacherId: string): Promise<void> {
  await authedFetch('/api/favorites', idToken, {
    method: 'DELETE',
    body: JSON.stringify({ teacherId }),
  })
  invalidateCache('favorites', 'matches')
}

export async function fetchSubscriptionStatus(idToken: string): Promise<SubscriptionStatus> {
  return cached('subscription', () => authedFetch('/api/subscription', idToken))
}

export async function uploadPaymentSlip(idToken: string, slipDataUrl: string): Promise<void> {
  await authedFetch('/api/subscription', idToken, {
    method: 'POST',
    body: JSON.stringify({ slip: slipDataUrl }),
  })
  invalidateCache('subscription')
}

// Both require login — never callable as an unverified visitor (see
// app/api/join/[code]/route.ts).
export async function fetchInvite(idToken: string, code: string): Promise<InviteLookup> {
  return authedFetch(`/api/join/${code}`, idToken)
}

export async function claimInvite(
  idToken: string,
  code: string,
  payload: ProfilePayload
): Promise<{ teacher: Teacher }> {
  return authedFetch(`/api/join/${code}`, idToken, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
