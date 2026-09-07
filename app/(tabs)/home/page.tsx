'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchProfile, fetchStats } from '@/lib/api'
import { withAuthRetry } from '@/lib/session'
import { StatsDashboard } from '@/components/stats-dashboard'
import type { PlatformStats } from '@/lib/types'

type View = 'loading' | 'ready' | 'error'

export default function HomePage() {
  const router = useRouter()
  const [view, setView] = useState<View>('loading')
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    async function bootstrap() {
      try {
        // Fetched together, not one-after-the-other — /api/stats doesn't
        // depend on the profile existing, so there's no reason to wait for
        // fetchProfile to finish before starting it.
        const { result } = await withAuthRetry(async (token) => {
          const [profile, stats] = await Promise.all([fetchProfile(token), fetchStats(token)])
          if (!profile.teacher) return { hasProfile: false as const }
          return { hasProfile: true as const, stats }
        })

        if (!result.hasProfile) {
          router.replace('/')
          return
        }

        setStats(result.stats)
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

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">หน้าแรก</h1>
      {stats && <StatsDashboard stats={stats} />}
    </div>
  )
}
