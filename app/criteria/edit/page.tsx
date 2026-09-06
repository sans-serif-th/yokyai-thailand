'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { fetchProfile, fetchSubscriptionStatus, saveProfile } from '@/lib/api'
import { withAuthRetry } from '@/lib/session'
import { CriteriaForm } from '@/components/criteria-form'
import type { OriginDestinationTab } from '@/components/origin-destination-tabs'
import { PAID_DESTINATION_LIMIT } from '@/lib/package-limits'
import type { Destination, ProfilePayload, Teacher } from '@/lib/types'

type View = 'loading' | 'ready' | 'error'

// useSearchParams() bails a statically-rendered page out to client-only
// rendering unless it's wrapped in Suspense — so the actual page content
// lives in this inner component, and the default export below just supplies
// the boundary.
function CriteriaEditPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab: OriginDestinationTab =
    searchParams.get('tab') === 'destination' ? 'destination' : 'origin'
  const [view, setView] = useState<View>('loading')
  const [idToken, setIdToken] = useState<string | null>(null)
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [maxDestinations, setMaxDestinations] = useState(PAID_DESTINATION_LIMIT)
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

        const status = await withAuthRetry((t) => fetchSubscriptionStatus(t))
        setMaxDestinations(status.result.maxDestinations)

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
    <CriteriaForm
      teacher={teacher}
      initialDestinations={destinations}
      maxDestinations={maxDestinations}
      initialTab={initialTab}
      onSave={handleSave}
    />
  )
}

export default function CriteriaEditPage() {
  return (
    <Suspense fallback={<p className="text-center p-8 text-zinc-600">กำลังโหลด...</p>}>
      <CriteriaEditPageContent />
    </Suspense>
  )
}
