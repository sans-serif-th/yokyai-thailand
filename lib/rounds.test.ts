import { describe, expect, it } from 'vitest'
import { roundPhase, validateRoundInput } from './round-phase'

const now = new Date('2026-10-18T12:00:00Z')
const r = (o: string | null, c: string | null) => ({ matching_opens_at: o, matching_closes_at: c })

describe('roundPhase', () => {
  it('no round or not scheduled = registration', () => {
    expect(roundPhase(null, now)).toBe('registration')
    expect(roundPhase(r(null, null), now)).toBe('registration')
  })
  it('future open = registration', () => {
    expect(roundPhase(r('2026-10-19T00:00:00Z', null), now)).toBe('registration')
  })
  it('opened, no close = matching', () => {
    expect(roundPhase(r('2026-10-01T00:00:00Z', null), now)).toBe('matching')
  })
  it('between open and close = matching', () => {
    expect(roundPhase(r('2026-10-01T00:00:00Z', '2026-10-30T00:00:00Z'), now)).toBe('matching')
  })
  it('after close = closed', () => {
    expect(roundPhase(r('2026-10-01T00:00:00Z', '2026-10-10T00:00:00Z'), now)).toBe('closed')
  })
})

describe('validateRoundInput', () => {
  const ok = { label: '1/2570', matching_opens_at: '2026-10-01T00:00:00Z', matching_closes_at: '2026-10-30T00:00:00Z' }
  it('accepts a valid window and open-ended rounds', () => {
    expect(validateRoundInput(ok)).toBeNull()
    expect(validateRoundInput({ ...ok, matching_closes_at: null })).toBeNull()
    expect(validateRoundInput({ label: 'x', matching_opens_at: null, matching_closes_at: null })).toBeNull()
  })
  it('rejects blank label, bad dates, close before open, close without open', () => {
    expect(validateRoundInput({ ...ok, label: '  ' })).not.toBeNull()
    expect(validateRoundInput({ ...ok, matching_opens_at: 'nope' })).not.toBeNull()
    expect(validateRoundInput({ ...ok, matching_closes_at: '2026-09-01T00:00:00Z' })).not.toBeNull()
    expect(validateRoundInput({ ...ok, matching_opens_at: null })).not.toBeNull()
  })
  it('validates the registration period', () => {
    expect(validateRoundInput({ ...ok, registration_opens_at: '2026-09-01T00:00:00Z', registration_closes_at: '2026-09-30T00:00:00Z' })).toBeNull()
    // only a deadline is fine
    expect(validateRoundInput({ ...ok, registration_closes_at: '2026-09-30T00:00:00Z' })).toBeNull()
    expect(validateRoundInput({ ...ok, registration_opens_at: 'nope' })).not.toBeNull()
    expect(validateRoundInput({ ...ok, registration_opens_at: '2026-09-30T00:00:00Z', registration_closes_at: '2026-09-01T00:00:00Z' })).not.toBeNull()
    // closes after matching opens
    expect(validateRoundInput({ ...ok, registration_closes_at: '2026-10-05T00:00:00Z' })).not.toBeNull()
    // matching not scheduled yet: no upper bound to compare against
    expect(validateRoundInput({ label: 'x', matching_opens_at: null, matching_closes_at: null, registration_closes_at: '2026-12-01T00:00:00Z' })).toBeNull()
  })
})
