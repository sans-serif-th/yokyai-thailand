'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchProfile, saveProfile } from '@/lib/api'
import { getLiffIdToken, initLiff } from '@/lib/liff'
import { ProfileSettingsForm } from '@/components/profile-settings-form'
import type { Destination, ProfilePayload, Teacher } from '@/lib/types'

type View = 'loading' | 'ready' | 'error'

export default function ProfilePage() {
  const router = useRouter()
  const [view, setView] = useState<View>('loading')
  const [idToken, setIdToken] = useState<string | null>(null)
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    async function bootstrap() {
      try {
        await initLiff()
        const token = getLiffIdToken()
        setIdToken(token)

        const profile = await fetchProfile(token)
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
    const { teacher: saved } = await saveProfile(idToken, payload)
    setTeacher(saved)
  }

  function handleLoggedOut() {
    router.replace('/logged-out')
  }

  if (view === 'loading') {
    return <p className="text-center p-8 text-zinc-600">กำลังโหลด...</p>
  }

  if (view === 'error') {
    return <p className="text-center p-8 text-red-600">{errorMessage}</p>
  }

  if (!teacher) return null

  return (
    <ProfileSettingsForm
      teacher={teacher}
      initialDestinations={destinations}
      onSave={handleSave}
      onLoggedOut={handleLoggedOut}
    />
  )
}
