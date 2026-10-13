import { describe, expect, it } from 'vitest'
import { toContactView, type ContactRequestRow } from './contacts'
import type { Teacher } from './types'

const other = {
  id: 'other',
  display_name: 'สมชาย ใจดี',
  phone: '081-234-5678',
  line_id: 'somchai.j',
  facebook_url: 'https://facebook.com/x',
  position: 'teacher',
  teaching_group: 'math',
  origin_province: 'กรุงเทพมหานคร',
} as unknown as Teacher

function row(status: ContactRequestRow['status'], requester = 'me'): ContactRequestRow {
  return {
    id: 'r1',
    requester_id: requester,
    target_id: requester === 'me' ? 'other' : 'me',
    status,
    created_at: '2026-10-13T00:00:00Z',
    responded_at: null,
    send_count: 1,
  }
}

describe('toContactView', () => {
  it.each(['pending', 'declined'] as const)('hides name and contact details while %s', (status) => {
    const v = toContactView(row(status), 'me', other)
    expect(v.name).toBeNull()
    expect(v.lineId).toBeNull()
    expect(v.phone).toBeNull()
    expect(v.facebookUrl).toBeNull()
    expect(v.maskedName).toBe('ส***** ใ*****')
  })

  it('reveals name, LINE ID, phone and facebook only when accepted', () => {
    const v = toContactView(row('accepted'), 'me', other)
    expect(v.name).toBe('สมชาย ใจดี')
    expect(v.lineId).toBe('somchai.j')
    expect(v.phone).toBe('081-234-5678')
    expect(v.facebookUrl).toBe('https://facebook.com/x')
  })

  it('reports direction relative to the viewer', () => {
    expect(toContactView(row('pending', 'me'), 'me', other).direction).toBe('outgoing')
    expect(toContactView(row('pending', 'other'), 'me', other).direction).toBe('incoming')
  })
})

describe('toContactView sends left', () => {
  it('counts down for the requester and stays full for the target', () => {
    const r = { ...row('cancelled', 'me'), send_count: 2 }
    expect(toContactView(r, 'me', other).sendsLeft).toBe(1)
    expect(toContactView(r, 'other', other).sendsLeft).toBe(3)
  })
})
