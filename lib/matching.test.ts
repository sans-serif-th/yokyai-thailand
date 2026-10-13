import { describe, expect, it } from 'vitest'
import { maskName, sanitizeForMatch } from './matching'
import type { Teacher } from './types'

const teacher: Teacher = {
  id: 't1',
  line_user_id: 'U1',
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
  facebook_url: 'https://facebook.com/x',
  phone: '0812345678',
  source: 'app',
  invite_code: 'ABC',
  claimed_at: null,
  category: 'teacher',
  admin_status: 'contacted' as Teacher['admin_status'],
}

describe('maskName', () => {
  it('keeps only the first character of each word', () => {
    expect(maskName('สมชาย ใจดี')).toBe('ส***** ใ*****')
    expect(maskName('  Anan   Wong ')).toBe('A***** W*****')
    expect(maskName('สมชาย')).toBe('ส*****')
  })
})

describe('sanitizeForMatch', () => {
  it('hides contact details and internal fields', () => {
    const s = sanitizeForMatch(teacher)
    expect(s.display_name).toBe('ส***** ใ*****')
    expect(s.phone).toBeNull()
    expect(s.invite_code).toBeNull()
    expect(s.admin_status).toBe('new')
    expect(s.facebook_url).toBe('https://facebook.com/x')
  })

  it('drops the facebook link for imported rows', () => {
    expect(sanitizeForMatch({ ...teacher, source: 'facebook_import' }).facebook_url).toBeNull()
  })
})
