'use client'

import { useCallback, useEffect, useState } from 'react'
import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  addFavorite,
  fetchAllImportedForDev,
  fetchMatches,
  fetchProfile,
  fetchRegistrationBreakdown,
  fetchRoundPhase,
  invalidateCache,
  removeFavorite,
  respondContactRequest,
  sendContactRequest,
} from '@/lib/api'
import { withAuthRetry } from '@/lib/session'
import { ContactRequests } from '@/components/contact-requests'
import { RefreshButton } from '@/components/refresh-button'
import { MatchList } from '@/components/match-list'
import { RoundPill } from '@/components/round-pill'
import { SegmentedTabs } from '@/components/segmented-tabs'
import { TopBar } from '@/components/top-bar'
import { RegistrationBreakdownView } from '@/components/registration-breakdown'
import { MAX_CONTACT_SENDS, type MatchContact } from '@/lib/types'
import type { MatchResult, RegistrationBreakdown } from '@/lib/types'
import { PageSkeleton } from '@/components/page-skeleton'

type View = 'loading' | 'registration' | 'ready' | 'error'

// Client-side gate for showing the button at all — the API route enforces
// the same flag server-side (returns 404 when unset), so this is purely
// cosmetic (no point rendering a button that 404s).
const DEV_TOOLS_ENABLED = process.env.NEXT_PUBLIC_DEV_TOOLS === '1'

type MatchesTab = 'matches' | 'contacts'

// useSearchParams needs a Suspense boundary during prerender.
export default function MatchesPage() {
  return (
    <Suspense fallback={<PageSkeleton title="ผลการจับคู่" />}>
      <MatchesContent />
    </Suspense>
  )
}

function MatchesContent() {
  const router = useRouter()
  // The tab lives in the URL (?tab=contacts) so LINE notification links and the
  // "ดูคำขอ" links on match cards can open it directly.
  const tab: MatchesTab = useSearchParams().get('tab') === 'contacts' ? 'contacts' : 'matches'
  const [view, setView] = useState<View>('loading')
  const [closed, setClosed] = useState(false)
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [devMode, setDevMode] = useState(false)
  const [devMatches, setDevMatches] = useState<MatchResult[] | null>(null)
  const [devLoading, setDevLoading] = useState(false)
  const [breakdown, setBreakdown] = useState<RegistrationBreakdown | null>(null)
  const [roundLabel, setRoundLabel] = useState<string | null>(null)
  // Bumped by the refresh button to re-run the bootstrap effect below.
  const [refreshKey, setRefreshKey] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [contactsRefreshKey, setContactsRefreshKey] = useState(0)
  const [contactsRefreshing, setContactsRefreshing] = useState(false)

  useEffect(() => {
    async function bootstrap() {
      try {
        // fetchMatches runs alongside the profile/phase calls instead of
        // after them: that chain was two full round-trips deep, which is what
        // made this tab wait seconds. The server gates matching by round
        // itself (findMatchesFor returns [] outside the matching phase), so
        // the early request is cheap when it isn't needed and its result is
        // simply ignored. A failure (e.g. no profile yet) is ignored here
        // too; fetchProfile reports the real error.
        const { result } = await withAuthRetry(async (token) => {
          const matchesEarly = fetchMatches(token).catch(() => null)
          const [profile, phase] = await Promise.all([fetchProfile(token), fetchRoundPhase(token)])
          if (!profile.teacher) return { state: 'onboarding' as const }
          if (!phase.inMatchingPhase) {
            const breakdown = await fetchRegistrationBreakdown(token)
            return { state: 'registration' as const, breakdown, roundLabel: phase.roundLabel, closed: phase.phase === 'closed' }
          }
          const early = await matchesEarly
          const { matches } = early ?? (await fetchMatches(token))
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
      } finally {
        setRefreshing(false)
      }
    }
    bootstrap()
  }, [router, refreshKey])

  function handleRefresh() {
    setRefreshing(true)
    invalidateCache('matches', 'round-phase', 'breakdown', 'profile')
    setRefreshKey((k) => k + 1)
  }

  function handleRefreshContacts() {
    setContactsRefreshing(true)
    invalidateCache('contacts')
    setContactsRefreshKey((k) => k + 1)
  }

  const handleContactsLoaded = useCallback(() => setContactsRefreshing(false), [])

  async function handleToggleFavorite(teacherId: string, currentlyFavorited: boolean) {
    const flip = (prev: MatchResult[]) =>
      prev.map((m) => (m.teacher.id === teacherId ? { ...m, favorited: !currentlyFavorited } : m))
    setMatches(flip)
    setDevMatches((prev) => (prev ? flip(prev) : prev))
    try {
      await withAuthRetry((token) =>
        currentlyFavorited ? removeFavorite(token, teacherId) : addFavorite(token, teacherId)
      )
    } catch (err) {
      // Revert the optimistic update if the request failed.
      const revert = (prev: MatchResult[]) =>
        prev.map((m) => (m.teacher.id === teacherId ? { ...m, favorited: currentlyFavorited } : m))
      setMatches(revert)
      setDevMatches((prev) => (prev ? revert(prev) : prev))
      // Let the card tell the user the save failed.
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

  async function handleToggleDevMode() {
    if (devMode) {
      setDevMode(false)
      return
    }
    setDevMode(true)
    if (devMatches !== null) return // already fetched once this session
    setDevLoading(true)
    try {
      const { result } = await withAuthRetry((token) => fetchAllImportedForDev(token))
      setDevMatches(result.matches)
    } catch (err) {
      setDevMatches([])
      setErrorMessage((err as Error).message)
    } finally {
      setDevLoading(false)
    }
  }

  if (view === 'loading') {
    return <PageSkeleton title="ผลการจับคู่" />
  }

  if (view === 'error') {
    return <p className="text-center p-8 text-terracotta">{errorMessage}</p>
  }

  if (view === 'registration') {
    return breakdown ? (
      <RegistrationBreakdownView
        breakdown={breakdown}
        roundLabel={roundLabel}
        closed={closed}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />
    ) : null
  }

  const viewTabs = (
    <SegmentedTabs<MatchesTab>
      value={tab}
      onChange={(next) =>
        router.replace(next === 'contacts' ? '/matches?tab=contacts' : '/matches', { scroll: false })
      }
      options={[
        { value: 'matches', label: 'ผลจับคู่' },
        { value: 'contacts', label: 'คำขอติดต่อ' },
      ]}
    />
  )

  if (tab === 'contacts') {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col gap-5 px-4 pb-6">
        <TopBar
          title="ผลการจับคู่"
          right={
            <>
              <RoundPill roundLabel={roundLabel} />
              <RefreshButton onClick={handleRefreshContacts} refreshing={contactsRefreshing} />
            </>
          }
        />
        {viewTabs}
        <ContactRequests refreshKey={contactsRefreshKey} onLoaded={handleContactsLoaded} />
      </div>
    )
  }

  const devControls = (
    <>
      {DEV_TOOLS_ENABLED && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleToggleDevMode}
            className="text-xs rounded-full px-3 py-1 border border-dashed border-zinc-400 text-zinc-600 bg-zinc-50"
          >
            {devMode ? '🔧 ออกจากโหมดทดสอบ' : '🔧 โหมดทดสอบ: ดูข้อมูลนำเข้าทั้งหมด'}
          </button>
        </div>
      )}
      {devMode && (
        <p className="text-xs text-zinc-500">
          กำลังแสดงข้อมูลนำเข้าทั้งหมด (ไม่ผ่านเงื่อนไขการจับคู่จริง) — สำหรับทดสอบเท่านั้น
        </p>
      )}
    </>
  )

  return devMode && devLoading ? (
    <p className="text-center p-8 text-zinc-600">กำลังโหลด...</p>
  ) : (
    <MatchList
      matches={devMode ? (devMatches ?? []) : matches}
      onToggleFavorite={handleToggleFavorite}
      viewTabs={viewTabs}
      devControls={devControls}
      onRequestContact={devMode ? undefined : handleRequestContact}
      onCancelContact={devMode ? undefined : handleCancelContact}
      showSettingsLink
      roundLabel={roundLabel}
      onRefresh={handleRefresh}
      refreshing={refreshing}
    />
  )
}
