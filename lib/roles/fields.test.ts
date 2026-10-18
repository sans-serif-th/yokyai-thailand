import { describe, expect, it } from 'vitest'
import { fieldsToRow, validateFieldValue, validateFields, type FieldDef } from './fields'

const sel: FieldDef = { key: 'k', column: 'c', label: 'K', type: 'select', options: ['a', 'b'] }
const num: FieldDef = { key: 'n', column: 'n', label: 'N', type: 'number', min: 1, max: 5, required: true }
const txt: FieldDef = { key: 't', column: 't', label: 'T', type: 'text', trim: true, pattern: /^\d+$/ }

describe('validateFieldValue', () => {
  it('select accepts only listed options; blank ok when optional', () => {
    expect(validateFieldValue(sel, 'a')).toBe(true)
    expect(validateFieldValue(sel, 'z')).toBe(false)
    expect(validateFieldValue(sel, null)).toBe(true)
  })
  it('number enforces integer range and required', () => {
    expect(validateFieldValue(num, 3)).toBe(true)
    expect(validateFieldValue(num, 6)).toBe(false)
    expect(validateFieldValue(num, 1.5)).toBe(false)
    expect(validateFieldValue(num, '3')).toBe(false)
    expect(validateFieldValue(num, null)).toBe(false)
  })
  it('text checks the trimmed pattern; empty trimmed text is allowed when optional', () => {
    expect(validateFieldValue(txt, ' 12 ')).toBe(true)
    expect(validateFieldValue(txt, 'ab')).toBe(false)
    expect(validateFieldValue(txt, '  ')).toBe(true)
  })
})

describe('fields helpers', () => {
  it('validateFields checks every field', () => {
    expect(validateFields([sel, num], { k: 'a', n: 2 })).toBe(true)
    expect(validateFields([sel, num], { k: 'a' })).toBe(false)
  })
  it('fieldsToRow maps keys to columns and nulls blanks', () => {
    expect(fieldsToRow([sel, txt], { k: 'a', t: '  ' })).toEqual({ c: 'a', t: null })
  })
})
