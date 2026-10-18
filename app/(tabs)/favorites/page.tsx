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
        // Sequential, not parallel with fetchFavorites: while the active
        // round is still in its registration phase, this should never
        // trigger the real (more expensive) findMatchesFor query at all —
        // that query already returns [] itself during registration phase,
        // but skipping the call entirely avoids the wasted round-trip.
        const { result } = await withAuthRetry(async (token) => {
          const [profile, phase] = await Promise.all([fetchProfile(token), fetchRoundPhase(token)])
          if (!profile.teacher) return { state: 'onboarding' as const }
          if (!phase.inMatchingPhase) {
            const breakdown = await fetchRegistrationBreakdown(token)
            return { state: 'registration' as const, breakdown, roundLabel: phase.roundLabel, closed: phase.phase === 'closed' }
          }
          const { matches } = await fetchFavorites(token)
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
    return <p className="text-center p-8 text-terracotta">{errorMessage}</p>
  }

  if (view === 'registration') {
    return breakdown ? (
      <RegistrationBreakdownView breakdown={breakdown} roundLabel={roundLabel} closed={closed} />
    ) : null
  }

  if (matches.length === 0) {
    return (
      <div className="max-w-lg mx-auto p-4 text-center text-zinc-600">
        <p className="text-lg">ยังไม่มีรายการโปรด</p>
        <p className="text-sm mt-1">กดรูปหัวใจที่การ์ดในหน้าค้นหา เพื่อบันทึกไว้ดูภายหลัง</p>
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
