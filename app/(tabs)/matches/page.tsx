'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  addFavorite,
  fetchAllImportedForDev,
  fetchMatches,
  fetchProfile,
  removeFavorite,
} from '@/lib/api'
import { withAuthRetry } from '@/lib/session'
import { MatchList } from '@/components/match-list'
import type { MatchResult } from '@/lib/types'

type View = 'loading' | 'ready' | 'error'

// Client-side gate for showing the button at all — the API route enforces
// the same flag server-side (returns 404 when unset), so this is purely
// cosmetic (no point rendering a button that 404s).
const DEV_TOOLS_ENABLED = process.env.NEXT_PUBLIC_DEV_TOOLS === '1'

export default function MatchesPage() {
  const router = useRouter()
  const [view, setView] = useState<View>('loading')
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [devMode, setDevMode] = useState(false)
  const [devMatches, setDevMatches] = useState<MatchResult[] | null>(null)
  const [devLoading, setDevLoading] = useState(false)

  useEffect(() => {
    async function bootstrap() {
      try {
        const { result } = await withAuthRetry(async (token) => {
          const profile = await fetchProfile(token)
          if (!profile.teacher) return { hasProfile: false as const }
          const { matches } = await fetchMatches(token)
          return { hasProfile: true as const, matches }
        })

        if (!result.hasProfile) {
          router.replace('/')
          return
        }

        setMatches(result.matches)
        setView('ready')
      } catch (err) {
        setErrorMessage((err as Error).message)
        setView('error')
      }
    }
    bootstrap()
  }, [router])

  async function handleToggleFavorite(teacherId: string, currentlyFavorited: boolean) {
    const flip = (prev: MatchResult[]) =>
      prev.map((m) => (m.teacher.id === teacherId ? { ...m, favorited: !currentlyFavorited } : m))
    setMatches(flip)
    setDevMatches((prev) => (prev ? flip(prev) : prev))
    try {
      await withAuthRetry((token) =>
        currentlyFavorited ? removeFavorite(token, teacherId) : addFavorite(token, teacherId)
      )
    } catch {
      // Revert the optimistic update if the request failed.
      const revert = (prev: MatchResult[]) =>
        prev.map((m) => (m.teacher.id === teacherId ? { ...m, favorited: currentlyFavorited } : m))
      setMatches(revert)
      setDevMatches((prev) => (prev ? revert(prev) : prev))
    }
  }

  async function handleToggleDevMode() {
    if (devMode) {
      setDevMode(false)
      return
    }
    setDevMode(true)
    if (devMatches !== null) return // already fetched once this session
    setDevLoading(true)
    try {
      const { result } = await withAuthRetry((token) => fetchAllImportedForDev(token))
      setDevMatches(result.matches)
    } catch (err) {
      setDevMatches([])
      setErrorMessage((err as Error).message)
    } finally {
      setDevLoading(false)
    }
  }

  if (view === 'loading') {
    return <p className="text-center p-8 text-zinc-600">กำลังโหลด...</p>
  }

  if (view === 'error') {
    return <p className="text-center p-8 text-terracotta">{errorMessage}</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {DEV_TOOLS_ENABLED && (
        <div className="max-w-lg mx-auto w-full px-4 pt-4 flex justify-end">
          <button
            type="button"
            onClick={handleToggleDevMode}
            className="text-xs rounded-full px-3 py-1 border border-dashed border-zinc-400 text-zinc-600 bg-zinc-50"
          >
            {devMode ? '🔧 ออกจากโหมดทดสอบ' : '🔧 โหมดทดสอบ: ดูข้อมูลนำเข้าทั้งหมด'}
          </button>
        </div>
      )}
      {devMode && (
        <p className="max-w-lg mx-auto w-full px-4 text-xs text-zinc-500">
          กำลังแสดงข้อมูลนำเข้าทั้งหมด (ไม่ผ่านเงื่อนไขการจับคู่จริง) — สำหรับทดสอบเท่านั้น
        </p>
      )}
      {devMode && devLoading ? (
        <p className="text-center p-8 text-zinc-600">กำลังโหลด...</p>
      ) : (
        <MatchList
          matches={devMode ? (devMatches ?? []) : matches}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </div>
  )
}
