import { describe, expect, it } from 'vitest'
import { clientIp, isLoginBlocked, isOverPositionRequestLimit } from './rate-limit'

describe('isLoginBlocked', () => {
  it('lets a few wrong passwords through', () => {
    expect(isLoginBlocked({ usernameAndIp: 4, ip: 4 })).toBe(false)
  })
  it('blocks the fifth failure for one username from one address', () => {
    expect(isLoginBlocked({ usernameAndIp: 5, ip: 5 })).toBe(true)
  })
  it('blocks an address that tries many usernames', () => {
    expect(isLoginBlocked({ usernameAndIp: 1, ip: 20 })).toBe(true)
    expect(isLoginBlocked({ usernameAndIp: 1, ip: 19 })).toBe(false)
  })
})

describe('isOverPositionRequestLimit', () => {
  it('allows 5 requests a day and blocks the 6th', () => {
    expect(isOverPositionRequestLimit(4)).toBe(false)
    expect(isOverPositionRequestLimit(5)).toBe(true)
  })
})

describe('clientIp', () => {
  const req = (h: Record<string, string>) => new Request('https://x.test', { headers: h })
  it('takes the first forwarded address', () => {
    expect(clientIp(req({ 'x-forwarded-for': '1.2.3.4, 10.0.0.1' }))).toBe('1.2.3.4')
  })
  it('falls back to x-real-ip then unknown', () => {
    expect(clientIp(req({ 'x-real-ip': '5.6.7.8' }))).toBe('5.6.7.8')
    expect(clientIp(req({}))).toBe('unknown')
  })
})
