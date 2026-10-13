import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ApiError,
  addFavorite,
  fetchMatches,
  fetchProfile,
  fetchRoundPhase,
  invalidateCache,
  saveProfile,
} from './api'

function jsonResponse(body: unknown, status = 200) {
  return { ok: status < 400, status, json: async () => body }
}

const fetchMock = vi.fn()

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
  invalidateCache()
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('request cache', () => {
  it('serves a repeat GET from cache', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ teacher: null, destinations: [] }))
    await fetchProfile('tok')
    await fetchProfile('tok')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('dedupes concurrent callers', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ inMatchingPhase: true, roundLabel: '1/2570' }))
    await Promise.all([fetchRoundPhase('tok'), fetchRoundPhase('tok')])
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('refetches after the 60s TTL', async () => {
    vi.useFakeTimers()
    fetchMock.mockResolvedValue(jsonResponse({ matches: [] }))
    await fetchMatches('tok')
    vi.advanceTimersByTime(61_000)
    await fetchMatches('tok')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('does not cache failures', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'boom' }, 500))
    await expect(fetchMatches('tok')).rejects.toBeInstanceOf(ApiError)
    fetchMock.mockResolvedValueOnce(jsonResponse({ matches: [] }))
    await expect(fetchMatches('tok')).resolves.toEqual({ matches: [] })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('carries the HTTP status on ApiError', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: 'expired' }, 401))
    await expect(fetchProfile('tok')).rejects.toMatchObject({ status: 401, message: 'expired' })
  })

  it('clears everything after saving the profile', async () => {
    fetchMock.mockImplementation(async (path: string, init?: RequestInit) =>
      init?.method === 'PUT'
        ? jsonResponse({ teacher: {} })
        : jsonResponse(path.includes('matches') ? { matches: [] } : { teacher: null })
    )
    await fetchProfile('tok')
    await fetchMatches('tok')
    await saveProfile('tok', {} as never)
    await fetchProfile('tok')
    await fetchMatches('tok')
    // profile x2, matches x2, PUT x1
    expect(fetchMock).toHaveBeenCalledTimes(5)
  })

  it('favoriting invalidates matches but not the profile', async () => {
    fetchMock.mockImplementation(async (path: string, init?: RequestInit) =>
      init?.method === 'POST'
        ? jsonResponse({})
        : jsonResponse(path.includes('matches') ? { matches: [] } : { teacher: null })
    )
    await fetchProfile('tok')
    await fetchMatches('tok')
    await addFavorite('tok', 't1')
    await fetchProfile('tok')
    await fetchMatches('tok')
    // profile x1 (cached), matches x2, POST x1
    expect(fetchMock).toHaveBeenCalledTimes(4)
  })
})
