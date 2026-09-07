import { requiresTeachingGroup } from './positions'
import { createServiceClient, fetchAllRows } from './supabase-server'
import type { Destination, PlatformStats, RegistrationBreakdown, Teacher } from './types'

// Only the columns the stats functions actually select — not the full
// Teacher row (unlike app/api/admin/all-matches/route.ts, which needs
// every field to display the pairs; this only ever returns aggregate
// counts).
type StatsRow = Pick<Teacher, 'position' | 'service_type' | 'subject' | 'origin_province'> & {
  destinations: Destination[]
}

// Same reciprocal-pair definition used by the admin "Match Coverage" view
// (app/api/admin/all-matches/route.ts): position, service_type, the exact
// same subject (where the position has one at all — an unspecified subject
// can't count as a match), and each side wanting the other's origin
// province — counted across the *entire* dataset regardless of
// claimed/verified status, since this only ever surfaces as an aggregate
// count, never as the underlying pairs.
export function countMutualPairs(all: StatsRow[]): number {
  let count = 0
  for (let i = 0; i < all.length; i++) {
    const a = all[i]
    if (!a.destinations?.length) continue

    for (let j = i + 1; j < all.length; j++) {
      const b = all[j]
      if (!b.destinations?.length) continue

      if (a.position !== b.position) continue
      if (a.service_type !== b.service_type) continue
      if (requiresTeachingGroup(a.position) && (!a.subject || a.subject !== b.subject)) continue

      const aWantsBOrigin = a.destinations.some((d) => d.province === b.origin_province)
      const bWantsAOrigin = b.destinations.some((d) => d.province === a.origin_province)

      if (aWantsBOrigin && bWantsAOrigin) count++
    }
  }
  return count
}

// Builds descending-by-count entries from a list of nullable strings,
// skipping null/empty values — shared by every per-value breakdown below.
function tally(values: (string | null | undefined)[], key: 'province' | 'subject') {
  const counts = new Map<string, number>()
  for (const v of values) {
    if (!v) continue
    counts.set(v, (counts.get(v) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort(([, a], [, b]) => b - a)
    .map(([value, count]) => ({ [key]: value, count }) as { province: string; count: number } | { subject: string; count: number })
}

interface FullStats {
  platform: PlatformStats
  breakdown: RegistrationBreakdown
}

// These numbers are identical for every visitor (platform-wide aggregates,
// not per-user data) and don't need to be second-accurate, so a short
// shared cache turns "recompute across the whole teachers table on every
// Home tab / registration-breakdown visit" into a cache hit for the common
// case of several people loading either within the same couple of minutes
// on the same warm serverless instance — same idea as the LINE token-verify
// cache in lib/line-auth.ts, which is what made the rest of the app's
// first load noticeably faster. getPlatformStats() and
// getRegistrationBreakdown() share this one cache/one table scan.
const STATS_CACHE_TTL_MS = 5 * 60_000
let statsCache: { result: FullStats; cachedUntil: number } | null = null

async function getFullStats(): Promise<FullStats> {
  const now = Date.now()
  if (statsCache && statsCache.cachedUntil > now) {
    return statsCache.result
  }

  const result = await computeFullStats()
  statsCache = { result, cachedUntil: now + STATS_CACHE_TTL_MS }
  return result
}

// Platform-wide summary shown on the Home tab — see
// components/stats-dashboard.tsx. Every number here is a plain count;
// nothing about an individual teacher is ever derived from this function's
// return value.
export async function getPlatformStats(): Promise<PlatformStats> {
  return (await getFullStats()).platform
}

// Per-origin/destination-province and per-subject registrant counts, shown
// on the matches/favorites tabs in place of match results while the active
// round is still in its registration phase — see
// components/registration-breakdown.tsx and lib/rounds.ts.
export async function getRegistrationBreakdown(): Promise<RegistrationBreakdown> {
  return (await getFullStats()).breakdown
}

async function computeFullStats(): Promise<FullStats> {
  const supabase = createServiceClient()

  // Page through with .range() — a plain select silently caps at 1000 rows
  // once the table passes that size (see fetchAllRows).
  const { data, error } = await fetchAllRows<StatsRow>((from, to) =>
    supabase
      .from('teachers')
      .select(
        `
        position,
        service_type,
        subject,
        origin_province,
        destinations (*)
      `
      )
      .range(from, to)
  )

  if (error) throw new Error(error.message)
  const all = data ?? []

  const originProvinces = new Set<string>()
  const destinationProvinces = new Set<string>()
  const subjects = new Set<string>()
  const destinationProvinceValues: string[] = []

  for (const t of all) {
    if (t.origin_province) originProvinces.add(t.origin_province)
    if (t.subject) subjects.add(t.subject)
    for (const d of t.destinations ?? []) {
      if (d.province) {
        destinationProvinces.add(d.province)
        destinationProvinceValues.push(d.province)
      }
    }
  }

  const platform: PlatformStats = {
    totalRegistered: all.length,
    originProvinceCount: originProvinces.size,
    destinationProvinceCount: destinationProvinces.size,
    matchCount: countMutualPairs(all),
    subjectCount: subjects.size,
  }

  const breakdown: RegistrationBreakdown = {
    totalRegistered: all.length,
    byOriginProvince: tally(
      all.map((t) => t.origin_province),
      'province'
    ) as { province: string; count: number }[],
    byDestinationProvince: tally(destinationProvinceValues, 'province') as {
      province: string
      count: number
    }[],
    bySubject: tally(
      all.map((t) => t.subject),
      'subject'
    ) as { subject: string; count: number }[],
  }

  return { platform, breakdown }
}
