'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchProfile, saveProfile } from '@/lib/api'
import { withAuthRetry } from '@/lib/session'
import { CriteriaForm } from '@/components/criteria-form'
import type { Destination, ProfilePayload, Teacher } from '@/lib/types'

type View = 'loading' | 'ready' | 'error'

export default function CriteriaPage() {
  const router = useRouter()
  const [view, setView] = useState<View>('loading')
  const [idToken, setIdToken] = useState<string | null>(null)
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    async function bootstrap() {
      try {
        const { token, result: profile } = await withAuthRetry((t) => fetchProfile(t))
        setIdToken(token)

        if (!profile.teacher) {
          router.replace('/')
          return
        }

        setTeacher(profile.teacher)
        setDestinations(profile.destinations ?? [])
        setView('ready')
      } catch (err) {
        setErrorMessage((err as Error).message)
        setView('error')
      }
    }
    bootstrap()
  }, [router])

  async function handleSave(payload: ProfilePayload) {
    if (!idToken) throw new Error('Not logged in')
    await withAuthRetry((t) => saveProfile(t, payload))
    // Search criteria changed — go show the freshly matching results.
    router.push('/matches')
  }

  if (view === 'loading') {
    return <p className="text-center p-8 text-zinc-600">กำลังโหลด...</p>
  }

  if (view === 'error') {
    return <p className="text-center p-8 text-terracotta">{errorMessage}</p>
  }

  if (!teacher) return null

  return (
    <CriteriaForm teacher={teacher} initialDestinations={destinations} onSave={handleSave} />
  )
}
