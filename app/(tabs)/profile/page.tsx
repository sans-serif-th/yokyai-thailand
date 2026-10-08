'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchProfile } from '@/lib/api'
import { withAuthRetry } from '@/lib/session'
import { ProfileMenu } from '@/components/profile-menu'
import type { Teacher } from '@/lib/types'
import { PageSkeleton } from '@/components/page-skeleton'

type View = 'loading' | 'ready' | 'error'

export default function ProfilePage() {
  const router = useRouter()
  const [view, setView] = useState<View>('loading')
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    async function bootstrap() {
      try {
        const { result: profile } = await withAuthRetry((t) => fetchProfile(t))

        if (!profile.teacher) {
          router.replace('/')
          return
        }

        setTeacher(profile.teacher)
        setView('ready')
      } catch (err) {
        setErrorMessage((err as Error).message)
        setView('error')
      }
    }
    bootstrap()
  }, [router])

  function handleLoggedOut() {
    router.replace('/logged-out')
  }

  if (view === 'loading') {
    return <PageSkeleton title="โปรไฟล์" />
  }

  if (view === 'error') {
    return <p className="text-center p-8 text-terracotta">{errorMessage}</p>
  }

  if (!teacher) return null

  return <ProfileMenu teacher={teacher} onLoggedOut={handleLoggedOut} />
}
