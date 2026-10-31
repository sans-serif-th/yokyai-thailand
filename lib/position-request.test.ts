import { describe, expect, it } from 'vitest'
import {
  CRITERIA_MAX,
  POSITION_NAME_MAX,
  formatScheduledTransfer,
  normalizePositionRequest,
  scheduleYearOptions,
  validatePositionRequest,
} from './position-request'

const ok = { positionName: 'พยาบาลวิชาชีพ', transferRound: '', criteria: 'ย้ายได้เมื่ออยู่ครบ 2 ปี', contactConsent: false }

describe('normalizePositionRequest', () => {
  it('trims strings and only accepts a literal true for consent', () => {
    expect(
      normalizePositionRequest({ positionName: '  ครู  ', transferRound: ' มีนาคม 2570 ', criteria: ' x ', contactConsent: true })
    ).toEqual({ positionName: 'ครู', transferRound: 'มีนาคม 2570', criteria: 'x', contactConsent: true })
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

describe('scheduled transfer (month + year)', () => {
  it('formats a 0-based month index and a พ.ศ. year', () => {
    expect(formatScheduledTransfer(0, 2570)).toBe('มกราคม 2570')
    expect(formatScheduledTransfer(11, 2571)).toBe('ธันวาคม 2571')
  })
  it('offers this พ.ศ. year and the next two', () => {
    expect(scheduleYearOptions(new Date('2026-10-31'))).toEqual([2569, 2570, 2571])
  })
  it('accepts what the form sends and nothing else', () => {
    expect(validatePositionRequest({ ...ok, transferRound: 'มีนาคม 2570' })).toBeNull()
    expect(validatePositionRequest({ ...ok, transferRound: '' })).toBeNull()
    expect(validatePositionRequest({ ...ok, transferRound: 'รอบที่ 1 / 2570' })).not.toBeNull()
    expect(validatePositionRequest({ ...ok, transferRound: 'มีนาคม 1999' })).not.toBeNull()
    expect(validatePositionRequest({ ...ok, transferRound: 'March 2570' })).not.toBeNull()
  })
})
