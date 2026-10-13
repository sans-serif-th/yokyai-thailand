import { describe, expect, it } from 'vitest'
import {
  TRANSFER_ROUND_PATTERN,
  formatTransferRound,
  parseTransferRoundYear,
  toBuddhistYear,
  transferRoundYearOptions,
  upcomingTransferYears,
} from './transfer-rounds'

describe('transfer rounds', () => {
  it('converts Gregorian to พ.ศ.', () => {
    expect(toBuddhistYear(2027)).toBe(2570)
  })

  it('offers exactly รอบที่ 1 / 2570 and รอบที่ 2 / 2570', () => {
    const opts = transferRoundYearOptions(upcomingTransferYears())
    expect(opts).toEqual([
      { value: '1-2027', label: 'รอบที่ 1 / 2570' },
      { value: '2-2027', label: 'รอบที่ 2 / 2570' },
    ])
  })

  it('round trips the option value', () => {
    expect(parseTransferRoundYear('2-2027')).toEqual({ round: '2', year: '2027' })
    expect(parseTransferRoundYear('')).toEqual({ round: '', year: '' })
  })

  it('formats saved rows, including legacy year-only rows', () => {
    expect(formatTransferRound('1', 2027)).toBe('รอบที่ 1 / 2570')
    expect(formatTransferRound(null, 2027)).toBe('ปี 2570')
    expect(formatTransferRound('2', null)).toBe('รอบที่ 2')
    expect(formatTransferRound(null, null)).toBeNull()
  })

  it('only accepts round 1 or 2', () => {
    expect(TRANSFER_ROUND_PATTERN.test('1')).toBe(true)
    expect(TRANSFER_ROUND_PATTERN.test('2')).toBe(true)
    expect(TRANSFER_ROUND_PATTERN.test('3')).toBe(false)
    expect(TRANSFER_ROUND_PATTERN.test('12')).toBe(false)
  })
})
