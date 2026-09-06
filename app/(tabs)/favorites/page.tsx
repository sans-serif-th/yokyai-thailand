'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchFavorites, fetchProfile, removeFavorite } from '@/lib/api'
import { withAuthRetry } from '@/lib/session'
import { MatchList } from '@/components/match-list'
import type { MatchResult } from '@/lib/types'

type View = 'loading' | 'ready' | 'error'

export default function FavoritesPage() {
  const router = useRouter()
  const [view, setView] = useState<View>('loading')
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    async function bootstrap() {
      try {
        const { result } = await withAuthRetry(async (token) => {
          const profile = await fetchProfile(token)
          if (!profile.teacher) return { hasProfile: false as const }
          const { matches } = await fetchFavorites(token)
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

  // Every card here is already favorited — toggling always means "remove".
  async function handleToggleFavorite(teacherId: string) {
    const previous = matches
    setMatches((prev) => prev.filter((m) => m.teacher.id !== teacherId))
    try {
      await withAuthRetry((token) => removeFavorite(token, teacherId))
    } catch {
      setMatches(previous)
    }
  }

  if (view === 'loading') {
    return <p className="text-center p-8 text-zinc-600">กำลังโหลด...</p>
  }

  if (view === 'error') {
    return <p className="text-center p-8 text-terracotta">{errorMessage}</p>
  }

  if (matches.length === 0) {
    return (
      <div className="max-w-lg mx-auto p-4 text-center text-zinc-600">
        <p className="text-lg">ยังไม่มีรายการโปรด</p>
        <p className="text-sm mt-1">กดรูปหัวใจที่การ์ดในหน้าค้นหา เพื่อบันทึกไว้ดูภายหลัง</p>
      </div>
    )
  }

  return <MatchList matches={matches} onToggleFavorite={handleToggleFavorite} />
}
