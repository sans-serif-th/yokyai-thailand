import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { checkAdminToken, getAdminUsername, signAdminToken } from './admin-token'
import { hashPassword, verifyPassword } from './admin-password'

describe('admin token', () => {
  beforeEach(() => {
    process.env.ADMIN_TOKEN_SECRET = 'test-secret'
  })
  afterEach(() => {
    vi.useRealTimers()
    delete process.env.ADMIN_TOKEN_SECRET
  })

  it('round-trips the username', () => {
    const token = signAdminToken('alice')
    expect(getAdminUsername(token)).toBe('alice')
    expect(checkAdminToken(token)).toBe(true)
  })

  it('rejects the old unsigned base64 format and junk', () => {
    expect(checkAdminToken(Buffer.from('admin:123').toString('base64'))).toBe(false)
    expect(checkAdminToken('a.b.c')).toBe(false)
    expect(checkAdminToken(null)).toBe(false)
    expect(checkAdminToken('')).toBe(false)
  })

  it('rejects a tampered payload', () => {
    const [, sig] = signAdminToken('alice')!.split('.')
    const forged = Buffer.from(JSON.stringify({ u: 'bob', exp: 9999999999 })).toString('base64url')
    expect(checkAdminToken(`${forged}.${sig}`)).toBe(false)
  })

  it('rejects a token signed with another secret', () => {
    const token = signAdminToken('alice')
    process.env.ADMIN_TOKEN_SECRET = 'other'
    expect(checkAdminToken(token)).toBe(false)
  })

  it('expires', () => {
    vi.useFakeTimers()
    const token = signAdminToken('alice')
    vi.advanceTimersByTime(13 * 60 * 60 * 1000)
    expect(checkAdminToken(token)).toBe(false)
  })

  it('fails closed without a secret', () => {
    const token = signAdminToken('alice')
    delete process.env.ADMIN_TOKEN_SECRET
    expect(signAdminToken('alice')).toBeNull()
    expect(checkAdminToken(token)).toBe(false)
  })
})

describe('admin password', () => {
  it('verifies the right password only', async () => {
    const stored = await hashPassword('correct horse battery')
    expect(await verifyPassword('correct horse battery', stored)).toBe(true)
    expect(await verifyPassword('wrong', stored)).toBe(false)
    expect(await verifyPassword('x', 'garbage')).toBe(false)
  })
})
