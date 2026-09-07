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
    <div className="max-w-lg mx-auto p-4 flex flex-col gap-4">
      <h1 className="text-xl font-semibold">หน้าแรก</h1>
      {stats && <StatsDashboard stats={stats} />}

      <div className="card-surface">
        <h2 className="text-lg font-semibold mb-3">อัพเดทล่าสุด</h2>
        <div className="flex flex-col items-center gap-3">
          <a href="https://lin.ee/ZwsPm2X" target="_blank" rel="noopener noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element -- LINE's own embed markup, a small fixed badge, not worth next/image config for */}
            <img
              src="https://scdn.line-apps.com/n/line_add_friends/btn/th.png"
              alt="เพิ่มเพื่อน"
              height={36}
            />
          </a>
          {/* eslint-disable-next-line @next/next/no-img-element -- must stay a plain <img> so the browser's built-in save/long-press-to-save works */}
          <img
            src="https://qr-official.line.me/gs/M_639pequv_GW.png?oat__id=7130650&oat_content=qr"
            alt="QR โค้ดสำหรับเพิ่มเพื่อน LINE Official Account"
            className="w-48 h-48"
          />
          <p className="text-xs text-zinc-500 text-center">
            สแกน QR โค้ด หรือกดปุ่มด้านบนเพื่อติดตามข่าวสารและอัปเดตล่าสุดผ่าน LINE Official Account
            — บันทึกรูป QR ไว้แชร์ต่อได้เลย
          </p>
        </div>
      </div>
    </div>
  )
}
