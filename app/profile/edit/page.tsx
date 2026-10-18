'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchProfile, saveContact } from '@/lib/api'
import { withAuthRetry } from '@/lib/session'
import { ProfileEditForm } from '@/components/profile-edit-form'
import type { ContactPatch } from '@/lib/profile-payload'
import type { Teacher } from '@/lib/types'
import { PageSkeleton } from '@/components/page-skeleton'

type View = 'loading' | 'ready' | 'error'

export default function ProfileEditPage() {
  const router = useRouter()
  const [view, setView] = useState<View>('loading')
  const [idToken, setIdToken] = useState<string | null>(null)
  const [teacher, setTeacher] = useState<Teacher | null>(null)
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
        setView('ready')
      } catch (err) {
        setErrorMessage((err as Error).message)
        setView('error')
      }
    }
    bootstrap()
  }, [router])

  async function handleSave(patch: ContactPatch) {
    if (!idToken) throw new Error('Not logged in')
    await withAuthRetry((t) => saveContact(t, patch))
    router.push('/profile')
  }

  if (view === 'loading') {
    return <PageSkeleton title="แก้ไขโปรไฟล์" backHref="/profile" />
  }

  if (view === 'error') {
    return <p className="text-center p-8 text-terracotta">{errorMessage}</p>
  }

  if (!teacher) return null

  return <ProfileEditForm teacher={teacher} onSave={handleSave} />
}
