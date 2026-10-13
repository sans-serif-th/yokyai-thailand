import { beforeEach, describe, expect, it, vi } from 'vitest'

const liff = {
  initLiff: vi.fn(),
  getLiffIdToken: vi.fn(),
  isIdTokenExpired: vi.fn(),
  liffLogin: vi.fn(),
  liffLogout: vi.fn(),
}
vi.mock('./liff', () => liff)

async function load() {
  vi.resetModules()
  const session = await import('./session')
  const api = await import('./api')
  return { ...session, ApiError: api.ApiError }
}

// Resolves "never" calls: races against a macrotask so a hung promise is detectable.
const settles = (p: Promise<unknown>) =>
  Promise.race([
    p.then(
      () => true,
      () => true
    ),
    new Promise((r) => setTimeout(() => r(false), 20)),
  ])

beforeEach(() => {
  Object.values(liff).forEach((f) => f.mockReset())
  liff.initLiff.mockResolvedValue(undefined)
  liff.getLiffIdToken.mockReturnValue('tok')
  liff.isIdTokenExpired.mockReturnValue(false)
})

describe('withAuthRetry', () => {
  it('runs with the current token', async () => {
    const { withAuthRetry } = await load()
    const out = await withAuthRetry(async (t) => `ran:${t}`)
    expect(out).toEqual({ token: 'tok', result: 'ran:tok' })
    expect(liff.liffLogin).not.toHaveBeenCalled()
  })

  it('re-logins up front without calling the API when the token is expired', async () => {
    liff.isIdTokenExpired.mockReturnValue(true)
    const { withAuthRetry } = await load()
    const run = vi.fn()
    expect(await settles(withAuthRetry(run))).toBe(false) // hangs: page is redirecting
    expect(run).not.toHaveBeenCalled()
    expect(liff.liffLogout).toHaveBeenCalledTimes(1)
    expect(liff.liffLogin).toHaveBeenCalledTimes(1)
  })

  it('re-logins on a 401 and never resolves', async () => {
    const { withAuthRetry, ApiError } = await load()
    const p = withAuthRetry(async () => {
      throw new ApiError(401, 'expired')
    })
    expect(await settles(p)).toBe(false)
    expect(liff.liffLogin).toHaveBeenCalledTimes(1)
  })

  it('starts the login cycle only once for concurrent callers', async () => {
    liff.isIdTokenExpired.mockReturnValue(true)
    const { withAuthRetry } = await load()
    void withAuthRetry(vi.fn())
    void withAuthRetry(vi.fn())
    await settles(withAuthRetry(vi.fn()))
    expect(liff.liffLogout).toHaveBeenCalledTimes(1)
    expect(liff.liffLogin).toHaveBeenCalledTimes(1)
  })

  it('rethrows non-401 errors without logging out', async () => {
    const { withAuthRetry, ApiError } = await load()
    await expect(
      withAuthRetry(async () => {
        throw new ApiError(500, 'server')
      })
    ).rejects.toMatchObject({ status: 500 })
    expect(liff.liffLogout).not.toHaveBeenCalled()
  })
})
