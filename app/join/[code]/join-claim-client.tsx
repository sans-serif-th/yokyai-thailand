'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ApiError, claimInvite, fetchInvite, fetchProfile, type InviteLookup } from '@/lib/api'
import { withAuthRetry } from '@/lib/session'
import { ProfileForm } from '@/components/profile-form'
import type { ProfilePayload } from '@/lib/types'

type View = 'loading' | 'already-registered' | 'invalid' | 'ready' | 'error'

export function JoinClaimClient({ code }: { code: string }) {
  const router = useRouter()
  const [view, setView] = useState<View>('loading')
  const [invite, setInvite] = useState<InviteLookup | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    async function bootstrap() {
      try {
        // Login happens first, before anything about this record is shown
        // — never display scraped data to an unverified visitor.
        const { result } = await withAuthRetry(async (t) => {
          const profile = await fetchProfile(t)
          if (profile.teacher) return { alreadyRegistered: true as const }
          const lookup = await fetchInvite(t, code)
          return { alreadyRegistered: false as const, invite: lookup }
        })

        if (result.alreadyRegistered) {
          setView('already-registered')
          return
        }
        setInvite(result.invite)
        setView('ready')
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          setView('invalid')
          return
        }
        setErrorMessage((err as Error).message)
        setView('error')
      }
    }
    bootstrap()
  }, [code])

  async function handleClaim(payload: ProfilePayload) {
    await withAuthRetry((t) => claimInvite(t, code, payload))
    router.replace('/matches')
  }

  if (view === 'loading') {
    return <p className="text-center p-8 text-zinc-600">กำลังโหลด...</p>
  }

  if (view === 'error') {
    return <p className="text-center p-8 text-terracotta">{errorMessage}</p>
  }

  if (view === 'invalid') {
    return (
      <p className="text-center p-8 text-terracotta">ลิงก์นี้ไม่ถูกต้องหรือถูกใช้งานไปแล้ว</p>
    )
  }

  if (view === 'already-registered') {
    return (
      <div className="text-center p-8 flex flex-col gap-3 items-center">
        <p className="text-zinc-600">บัญชี LINE นี้มีโปรไฟล์อยู่แล้ว ไม่สามารถเชื่อมกับข้อมูลนี้ได้</p>
        <Link href="/matches" className="link-accent">
          ไปที่ผลการจับคู่ของฉัน
        </Link>
      </div>
    )
  }

  if (!invite) return null

  return (
    <div className="flex-1 py-8">
      <ProfileForm
        initialTeacher={invite.teacher}
        initialDestinations={invite.destinations}
        onSave={handleClaim}
      />
    </div>
  )
}
