'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  fetchFavorites,
  fetchProfile,
  fetchRegistrationBreakdown,
  fetchRoundPhase,
  removeFavorite,
  respondContactRequest,
  sendContactRequest,
} from '@/lib/api'
import { withAuthRetry } from '@/lib/session'
import { MatchList } from '@/components/match-list'
import { RegistrationBreakdownView } from '@/components/registration-breakdown'
import { MAX_CONTACT_SENDS, type MatchContact } from '@/lib/types'
import type { MatchResult, RegistrationBreakdown } from '@/lib/types'
import { PageSkeleton } from '@/components/page-skeleton'
import { TopBar } from '@/components/top-bar'
import { RoundPill } from '@/components/round-pill'

type View = 'loading' | 'registration' | 'ready' | 'error'

export default function FavoritesPage() {
  const router = useRouter()
  const [view, setView] = useState<View>('loading')
  const [closed, setClosed] = useState(false)
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [breakdown, setBreakdown] = useState<RegistrationBreakdown | null>(null)
  const [roundLabel, setRoundLabel] = useState<string | null>(null)

  useEffect(() => {
    async function bootstrap() {
      try {
        // fetchFavorites starts alongside the profile/phase calls rather than
        // after them (two round-trips deep otherwise). The server returns []
        // outside the matching phase, so the early request is cheap when
        // unused. Its failure is ignored; fetchProfile reports real errors.
        const { result } = await withAuthRetry(async (token) => {
          const favoritesEarly = fetchFavorites(token).catch(() => null)
          const [profile, phase] = await Promise.all([fetchProfile(token), fetchRoundPhase(token)])
          if (!profile.teacher) return { state: 'onboarding' as const }
          if (!phase.inMatchingPhase) {
            const breakdown = await fetchRegistrationBreakdown(token)
            return { state: 'registration' as const, breakdown, roundLabel: phase.roundLabel, closed: phase.phase === 'closed' }
          }
          const early = await favoritesEarly
          const { matches } = early ?? (await fetchFavorites(token))
          return { state: 'ready' as const, matches, roundLabel: phase.roundLabel }
        })

        if (result.state === 'onboarding') {
          router.replace('/')
          return
        }

        if (result.state === 'registration') {
          setBreakdown(result.breakdown)
          setRoundLabel(result.roundLabel)
          setClosed(result.closed)
          setView('registration')
          return
        }

        setMatches(result.matches)
        setRoundLabel(result.roundLabel)
        setView('ready')
      } catch (err) {
        setErrorMessage((err as Error).message)
        setView('error')
      }
    }
    bootstrap()
  }, [router])

  // Every card here is already favorited — toggling always means "remove".
  async function handleToggleFavorite(teacherId: string) {
    const previous = matches
    setMatches((prev) => prev.filter((m) => m.teacher.id !== teacherId))
    try {
      await withAuthRetry((token) => removeFavorite(token, teacherId))
    } catch {
      setMatches(previous)
    }
  }

  async function handleRequestContact(teacherId: string) {
    const prevContact = matches.find((m) => m.teacher.id === teacherId)?.contact
    const sendsLeft =
      prevContact?.status === 'cancelled' ? Math.max(0, prevContact.sendsLeft - 1) : MAX_CONTACT_SENDS - 1
    const setContact = (contact: MatchContact | null) => (prev: MatchResult[]) =>
      prev.map((m) => (m.teacher.id === teacherId ? { ...m, contact } : m))
    setMatches(
      setContact({ requestId: '', status: 'pending', direction: 'outgoing', sendsLeft })
    )
    try {
      const {
        result: { status, requestId },
      } = await withAuthRetry((token) =>
        sendContactRequest(token, teacherId)
      )
      setMatches(setContact({ requestId, status, direction: 'outgoing', sendsLeft }))
    } catch (err) {
      setMatches(setContact(prevContact ?? null))
      window.alert((err as Error).message)
    }
  }

  async function handleCancelContact(requestId: string) {
    const target = matches.find((m) => m.contact?.requestId === requestId)
    if (!target?.contact) return
    const before = target.contact
    const setContact = (contact: MatchContact) => (prev: MatchResult[]) =>
      prev.map((m) => (m.contact?.requestId === requestId ? { ...m, contact } : m))
    setMatches(setContact({ ...before, status: 'cancelled' }))
    try {
      await withAuthRetry((token) => respondContactRequest(token, requestId, 'cancel'))
    } catch (err) {
      setMatches(setContact(before))
      window.alert((err as Error).message)
    }
  }

  if (view === 'loading') {
    return <PageSkeleton title="รายการโปรด" />
  }

  if (view === 'error') {
    return (
      <div className="mx-auto w-full max-w-lg px-4 pb-6">
        <TopBar title="รายการโปรด" />
        <p className="p-8 text-center text-terracotta">{errorMessage}</p>
      </div>
    )
  }

  if (view === 'registration') {
    return breakdown ? (
      <RegistrationBreakdownView breakdown={breakdown} roundLabel={roundLabel} closed={closed} />
    ) : null
  }

  if (matches.length === 0) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 pb-6 text-zinc-600">
        <TopBar title="รายการโปรด" right={<RoundPill roundLabel={roundLabel} />} />
        <p className="mt-5 text-center text-lg">ยังไม่มีรายการโปรด</p>
        <p className="mt-1 text-center text-sm">กดรูปหัวใจที่การ์ดในหน้าค้นหา เพื่อบันทึกไว้ดูภายหลัง</p>
      </div>
    )
  }

  return (
    <MatchList
      matches={matches}
      onToggleFavorite={handleToggleFavorite}
      onRequestContact={handleRequestContact}
      onCancelContact={handleCancelContact}
      title="รายการโปรด"
      roundLabel={roundLabel}
    />
  )
}
