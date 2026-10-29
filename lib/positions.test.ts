import { describe, expect, it } from 'vitest'
import { POSITIONS, positionLabel, selectablePositions } from './positions'

describe('selectablePositions', () => {
  it('offers only ครูผู้สอน to someone with no position yet', () => {
    expect(selectablePositions('').map((p) => p.code)).toEqual(['teacher'])
    expect(selectablePositions().map((p) => p.code)).toEqual(['teacher'])
  })
  it('keeps a hidden position visible for the person who already holds it', () => {
    expect(selectablePositions('general_admin').map((p) => p.code)).toEqual(['teacher', 'general_admin'])
  })
  it('does not remove the position itself: labels and validation still know it', () => {
    expect(POSITIONS.map((p) => p.code)).toContain('general_admin')
    expect(positionLabel('general_admin')).toBe('นักจัดการงานทั่วไป')
  })
})
