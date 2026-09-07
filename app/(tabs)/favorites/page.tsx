'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchFavorites, fetchProfile, fetchQueueStatus, removeFavorite } from '@/lib/api'
import { withAuthRetry } from '@/lib/session'
import { MatchList } from '@/components/match-list'
import { QueueWaiting } from '@/components/queue-waiting'
import type { MatchResult } from '@/lib/types'

type View = 'loading' | 'waiting' | 'ready' | 'error'

export default function FavoritesPage() {
  const router = useRouter()
  const [view, setView] = useState<View>('loading')
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [queuePosition, setQueuePosition] = useState<number | null>(null)
  const [queueTotal, setQueueTotal] = useState<number | null>(null)

  useEffect(() => {
    async function bootstrap() {
      try {
        // Sequential, not parallel with fetchFavorites: a still-queued user
        // should never trigger the real (more expensive) findMatchesFor
        // query at all — that's the whole point of the queue.
        const { result } = await withAuthRetry(async (token) => {
          const profile = await fetchProfile(token)
          if (!profile.teacher) return { state: 'onboarding' as const }
          if (!profile.teacher.queue_released_at) {
            const queue = await fetchQueueStatus(token)
            return { state: 'waiting' as const, position: queue.position, totalWaiting: queue.totalWaiting }
          }
          const { matches } = await fetchFavorites(token)
          return { state: 'ready' as const, matches }
        })

        if (result.state === 'onboarding') {
          router.replace('/')
          return
        }

        if (result.state === 'waiting') {
          setQueuePosition(result.position)
          setQueueTotal(result.totalWaiting)
          setView('waiting')
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

  if (view === 'waiting') {
    return <QueueWaiting position={queuePosition} totalWaiting={queueTotal} />
  }

  if (matches.length === 0) {
    return (
      <div className="max-w-lg mx-auto p-4 text-center text-zinc-600">
        <p className="text-lg">ยังไม่มีรายการโปรด</p>
        <p className="text-sm mt-1">กดรูปหัวใจที่การ์ดในหน้าค้นหา เพื่อบันทึกไว้ดูภายหลัง</p>
      </div>
    )
  }

  return <MatchList matches={matches} onToggleFavorite={handleToggleFavorite} title="รายการโปรด" />
}
