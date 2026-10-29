import { describe, expect, it } from 'vitest'
import {
  CRITERIA_MAX,
  POSITION_NAME_MAX,
  normalizePositionRequest,
  validatePositionRequest,
} from './position-request'

const ok = { positionName: 'พยาบาลวิชาชีพ', transferRound: '', criteria: 'ย้ายได้เมื่ออยู่ครบ 2 ปี', contactConsent: false }

describe('normalizePositionRequest', () => {
  it('trims strings and only accepts a literal true for consent', () => {
    expect(
      normalizePositionRequest({ positionName: '  ครู  ', transferRound: ' 1-2027 ', criteria: ' x ', contactConsent: true })
    ).toEqual({ positionName: 'ครู', transferRound: '1-2027', criteria: 'x', contactConsent: true })
    expect(normalizePositionRequest({ contactConsent: 'true' }).contactConsent).toBe(false)
  })
  it('turns junk into empty values instead of throwing', () => {
    expect(normalizePositionRequest(null)).toEqual({ positionName: '', transferRound: '', criteria: '', contactConsent: false })
    expect(normalizePositionRequest({ positionName: 5, criteria: {} }).positionName).toBe('')
  })
})

describe('validatePositionRequest', () => {
  it('accepts a request with only the required fields', () => {
    expect(validatePositionRequest(ok)).toBeNull()
  })
  it('requires a position name and criteria', () => {
    expect(validatePositionRequest({ ...ok, positionName: '' })).not.toBeNull()
    expect(validatePositionRequest({ ...ok, criteria: '' })).not.toBeNull()
  })
  it('caps lengths', () => {
    expect(validatePositionRequest({ ...ok, positionName: 'ก'.repeat(POSITION_NAME_MAX + 1) })).not.toBeNull()
    expect(validatePositionRequest({ ...ok, criteria: 'ก'.repeat(CRITERIA_MAX + 1) })).not.toBeNull()
  })
})
