'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchProfile, fetchRoles, saveProfile } from '@/lib/api'
import { withAuthRetry } from '@/lib/session'
import { ProfileForm } from '@/components/profile-form'
import type { Destination, ProfilePayload, RoleInfo, Teacher } from '@/lib/types'

type View = 'loading' | 'onboarding' | 'error'

export default function Home() {
  const router = useRouter()
  const [view, setView] = useState<View>('loading')
  const [idToken, setIdToken] = useState<string | null>(null)
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [roles, setRoles] = useState<RoleInfo[] | undefined>(undefined)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    async function bootstrap() {
      try {
        const { token, result: profile } = await withAuthRetry((t) => fetchProfile(t))
        setIdToken(token)

        if (profile.teacher) {
          router.replace('/matches')
          return
        }

        // Best-effort: the welcome screen falls back to a static list.
        try {
          setRoles((await fetchRoles(token)).roles)
        } catch {}

        setTeacher(profile.teacher)
        setDestinations(profile.destinations ?? [])
        setView('onboarding')
      } catch (err) {
        setErrorMessage((err as Error).message)
        setView('error')
      }
    }
    bootstrap()
  }, [router])

  async function handleSaveProfile(payload: ProfilePayload) {
    if (!idToken) throw new Error('Not logged in')
    const { token } = await withAuthRetry((t) => saveProfile(t, payload))
    setIdToken(token)
    router.replace('/matches')
  }

  if (view === 'loading') {
    return <p className="text-center p-8 text-zinc-600">กำลังโหลด...</p>
  }

  if (view === 'error') {
    return <p className="text-center p-8 text-terracotta">{errorMessage}</p>
  }

  return (
    <div className="flex-1 py-8">
      <ProfileForm
        initialTeacher={teacher}
        initialDestinations={destinations}
        onSave={handleSaveProfile}
        roles={roles}
      />
    </div>
  )
}
