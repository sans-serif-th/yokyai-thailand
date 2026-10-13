import { describe, expect, it } from 'vitest'
import {
  profilePayloadToTeacherRow,
  teacherToPayload,
  validateProfilePayload,
} from './profile-payload'

const base = {
  displayName: 'สมชาย ใจดี',
  position: 'teacher',
  serviceType: 'primary',
  originProvince: 'เชียงใหม่',
  originDistrict: 'ดอยสะเก็ด',
  originZone: 'เขต 1',
  currentSchool: null,
  teachingGroup: 'math',
  subject: 'คณิตศาสตร์',
  benefitNote: null,
  transferRound: '1',
  transferYear: 2027,
  facebookUrl: null,
  phone: null,
  lineId: null,
  destinations: [{ province: 'กรุงเทพมหานคร', district: null, zone: null }],
}

describe('validateProfilePayload', () => {
  it('accepts a complete teacher payload', () => {
    expect(validateProfilePayload(base)).toBe(true)
  })

  it('treats school as optional', () => {
    expect(validateProfilePayload({ ...base, currentSchool: undefined })).toBe(true)
  })

  it('rejects non-objects and blank names', () => {
    expect(validateProfilePayload(null)).toBe(false)
    expect(validateProfilePayload('x')).toBe(false)
    expect(validateProfilePayload({ ...base, displayName: '   ' })).toBe(false)
  })

  it('requires a teaching group for teachers only', () => {
    expect(validateProfilePayload({ ...base, teachingGroup: null })).toBe(false)
    expect(validateProfilePayload({ ...base, teachingGroup: 'nope' })).toBe(false)
    expect(
      validateProfilePayload({ ...base, position: 'general_admin', teachingGroup: null })
    ).toBe(true)
    expect(
      validateProfilePayload({ ...base, position: 'general_admin', teachingGroup: 'math' })
    ).toBe(false)
  })

  it('validates phone format but allows empty', () => {
    expect(validateProfilePayload({ ...base, phone: '081-234 5678' })).toBe(true)
    expect(validateProfilePayload({ ...base, phone: '+66812345678' })).toBe(true)
    expect(validateProfilePayload({ ...base, phone: 'abc' })).toBe(false)
    expect(validateProfilePayload({ ...base, phone: '123' })).toBe(false)
    expect(validateProfilePayload({ ...base, phone: null })).toBe(true)
  })

  it('validates round and year', () => {
    expect(validateProfilePayload({ ...base, transferRound: '3' })).toBe(false)
    expect(validateProfilePayload({ ...base, transferYear: 1999 })).toBe(false)
    expect(validateProfilePayload({ ...base, transferYear: 2027.5 })).toBe(false)
  })

  it('requires at least one destination with a province', () => {
    expect(validateProfilePayload({ ...base, destinations: [] })).toBe(false)
    expect(validateProfilePayload({ ...base, destinations: [{}] })).toBe(false)
  })

  it('caps benefit note at 500 chars', () => {
    expect(validateProfilePayload({ ...base, benefitNote: 'ก'.repeat(500) })).toBe(true)
    expect(validateProfilePayload({ ...base, benefitNote: 'ก'.repeat(501) })).toBe(false)
  })
})

describe('profilePayloadToTeacherRow', () => {
  it('validates LINE ID format but allows empty', () => {
    expect(validateProfilePayload({ ...base, lineId: 'somchai.j' })).toBe(true)
    expect(validateProfilePayload({ ...base, lineId: '@yokyai' })).toBe(true)
    expect(validateProfilePayload({ ...base, lineId: 'ab' })).toBe(false)
    expect(validateProfilePayload({ ...base, lineId: 'has space' })).toBe(false)
    expect(validateProfilePayload({ ...base, lineId: null })).toBe(true)
  })

  it('maps to snake_case and trims phone', () => {
    const row = profilePayloadToTeacherRow({ ...base, phone: ' 0812345678 ' } as never)
    expect(row.phone).toBe('0812345678')
    expect(row.origin_province).toBe('เชียงใหม่')
    expect(row.teaching_group).toBe('math')
  })

  it('stores blank phone as null and drops subject/group for non-teachers', () => {
    const row = profilePayloadToTeacherRow({
      ...base,
      position: 'general_admin',
      teachingGroup: null,
      phone: '   ',
    } as never)
    expect(row.phone).toBeNull()
    expect(row.teaching_group).toBeNull()
    expect(row.subject).toBeNull()
  })
})

describe('teacherToPayload', () => {
  it('round-trips a stored teacher and applies overrides', () => {
    const teacher = {
      display_name: 'สมชาย ใจดี',
      position: 'teacher',
      service_type: 'primary',
      origin_province: 'เชียงใหม่',
      origin_district: null,
      origin_zone: null,
      current_school: null,
      teaching_group: 'math',
      subject: null,
      benefit_note: null,
      transfer_round: '1',
      transfer_year: 2027,
      facebook_url: null,
      phone: '0812345678',
      line_id: null,
    } as never
    const dests = [{ id: 'd', teacher_id: 't', province: 'กรุงเทพมหานคร', district: null, zone: null }]
    const p = teacherToPayload(teacher, dests, { lineId: 'somchai.j' })
    expect(p.displayName).toBe('สมชาย ใจดี')
    expect(p.phone).toBe('0812345678')
    expect(p.lineId).toBe('somchai.j')
    expect(p.destinations).toEqual([{ province: 'กรุงเทพมหานคร', district: null, zone: null }])
  })
})
