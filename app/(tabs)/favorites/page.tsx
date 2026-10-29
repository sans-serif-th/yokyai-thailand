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
import type { FavoriteRound, MatchResult, RegistrationBreakdown } from '@/lib/types'
import { PageSkeleton } from '@/components/page-skeleton'
import { TopBar } from '@/components/top-bar'
import { RoundPill } from '@/components/round-pill'
import { RoundSelect } from '@/components/round-select'

type View = 'loading' | 'registration' | 'ready' | 'error'

export default function FavoritesPage() {
  const router = useRouter()
  const [view, setView] = useState<View>('loading')
  const [closed, setClosed] = useState(false)
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [breakdown, setBreakdown] = useState<RegistrationBreakdown | null>(null)
  const [roundLabel, setRoundLabel] = useState<string | null>(null)
  const [rounds, setRounds] = useState<FavoriteRound[]>([])
  const [roundId, setRoundId] = useState<string | null>(null)
  const [switching, setSwitching] = useState(false)

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
          const { matches, rounds, roundId } = early ?? (await fetchFavorites(token))
          return { state: 'ready' as const, matches, rounds, roundId, roundLabel: phase.roundLabel }
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
        setRounds(result.rounds)
        setRoundId(result.roundId)
        setRoundLabel(result.roundLabel)
        setView('ready')
      } catch (err) {
        setErrorMessage((err as Error).message)
        setView('error')
      }
    }
    bootstrap()
  }, [router])

  const activeRoundId = rounds.find((r) => r.isActive)?.id ?? null
  // An earlier round's list is a record: nothing on it can be changed.
  const readOnly = roundId !== null && roundId !== activeRoundId

  async function handleSelectRound(nextId: string) {
    if (nextId === roundId) return
    setSwitching(true)
    try {
      const { result } = await withAuthRetry((token) =>
        fetchFavorites(token, nextId === activeRoundId ? null : nextId)
      )
      setMatches(result.matches)
      setRounds(result.rounds)
      setRoundId(result.roundId)
    } catch (err) {
      window.alert((err as Error).message)
    } finally {
      setSwitching(false)
    }
  }

  const roundControl =
    rounds.length > 1 && roundId ? (
      <RoundSelect rounds={rounds} value={roundId} onChange={handleSelectRound} disabled={switching} />
    ) : undefined

  // Every card here is already favorited — toggling always means "remove".
  async function handleToggleFavorite(teacherId: string) {
    const previous = matches
    setMatches((prev) => prev.filter((m) => m.teacher.id !== teacherId))
    try {
      await withAuthRetry((token) => removeFavorite(token, teacherId))
    } catch (err) {
      setMatches(previous)
      throw err
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
        <TopBar title="รายการโปรด" right={roundControl ?? <RoundPill roundLabel={roundLabel} />} />
        <p className="mt-5 text-center text-lg">{readOnly ? 'ไม่มีรายการโปรดในรอบนี้' : 'ยังไม่มีรายการโปรด'}</p>
        {!readOnly && (
          <p className="mt-1 text-center text-sm">กดรูปหัวใจที่การ์ดในหน้าค้นหา เพื่อบันทึกไว้ดูภายหลัง</p>
        )}
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
      roundControl={roundControl}
      readOnly={readOnly}
    />
  )
}
