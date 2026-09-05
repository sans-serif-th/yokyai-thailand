'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchMatches, fetchProfile } from '@/lib/api'
import { withAuthRetry } from '@/lib/session'
import { MatchList } from '@/components/match-list'
import type { MatchResult } from '@/lib/types'

type View = 'loading' | 'ready' | 'error'

export default function MatchesPage() {
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

  if (view === 'loading') {
    return <p className="text-center p-8 text-zinc-600">กำลังโหลด...</p>
  }

  if (view === 'error') {
    return <p className="text-center p-8 text-terracotta">{errorMessage}</p>
  }

  return <MatchList matches={matches} />
}
