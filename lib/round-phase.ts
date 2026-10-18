// Pure round-phase helpers — no server imports, so client components (the
// admin Round tab) can use them too. Re-exported from lib/rounds.ts.
import type { Round } from './types'

// A round is in its matching phase once matching_opens_at is set and has
// passed. NULL (not yet scheduled) or a future timestamp means the round
// is still in its registration/dashboard-only phase — see
// components/registration-breakdown.tsx. No active round at all -> false
// (fail closed: never show live results without a real round context —
// the opposite of getSubscriptionStatusFor's fail-open below, since that
// protects a paying user's destination limit, this protects match-result
// integrity). Pure/no I/O — takes an already-fetched Round so callers that
// already have one never need a second round-trip.
export function isRoundInMatchingPhase(round: Round | null, now: Date = new Date()): boolean {
  return roundPhase(round, now) === 'matching'
}

export type RoundPhase = 'registration' | 'matching' | 'closed'

// registration: matching not opened yet (or not scheduled); matching: opened
// and not yet closed; closed: matching_closes_at has passed. No round at all
// is 'registration' (fail closed, see above).
export function roundPhase(
  round: Pick<Round, 'matching_opens_at' | 'matching_closes_at'> | null,
  now: Date = new Date()
): RoundPhase {
  if (!round?.matching_opens_at || new Date(round.matching_opens_at) > now) return 'registration'
  if (round.matching_closes_at && new Date(round.matching_closes_at) <= now) return 'closed'
  return 'matching'
}

export interface RoundInput {
  label: string
  matching_opens_at: string | null
  matching_closes_at: string | null
}

// Returns an error message, or null when valid. Dates are ISO strings or null.
export function validateRoundInput(input: RoundInput): string | null {
  if (typeof input.label !== 'string' || !input.label.trim()) return 'กรุณาระบุชื่อรอบ'
  const dates: (Date | null)[] = []
  for (const v of [input.matching_opens_at, input.matching_closes_at]) {
    if (v === null) {
      dates.push(null)
      continue
    }
    const d = typeof v === 'string' ? new Date(v) : new Date(NaN)
    if (Number.isNaN(d.getTime())) return 'วันที่ไม่ถูกต้อง'
    dates.push(d)
  }
  const [opens, closes] = dates
  if (closes && !opens) return 'ต้องกำหนดวันเปิดจับคู่ก่อนกำหนดวันปิด'
  if (opens && closes && closes <= opens) return 'วันปิดจับคู่ต้องอยู่หลังวันเปิด'
  return null
}
