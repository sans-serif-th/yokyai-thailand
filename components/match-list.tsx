'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { HeartIcon, HomeIcon } from './icons'
import { TopBar } from './top-bar'
import { RoundPill } from './round-pill'
import { RefreshButton } from './refresh-button'
import { UnderlineTabs } from './underline-tabs'
import { getRoleFields } from '@/lib/roles/field-registry'
import { cardLinesFromFields } from '@/lib/roles/fields'
import { positionLabel } from '@/lib/positions'
import { serviceTypeAbbr } from '@/lib/service-types'
import { subjectLabel } from '@/lib/subject-label'
import { teachingGroupLabel } from '@/lib/teaching-groups'
import { MAX_CONTACT_SENDS, type MatchResult } from '@/lib/types'

function ContactAction({
  match,
  onRequest,
  onCancel,
}: {
  match: MatchResult
  onRequest: (teacherId: string) => void
  onCancel?: (requestId: string) => void
}) {
  const c = match.contact
  // Figma Button: 32px tall, full width, 8px radius, 16px bold. The card's own
  // 4px gap supplies the spacing above it.
  const box = 'flex h-8 w-full items-center justify-center rounded-lg px-5 text-base font-bold'
  const primary = `${box} bg-brand-red text-white`
  const muted = `${box} bg-zinc-100 text-zinc-500`

  if (c?.status === 'cancelled') {
    if (c.sendsLeft <= 0) return <span className={muted}>ส่งคำขอครบ {MAX_CONTACT_SENDS} ครั้งแล้ว</span>
    return (
      <button type="button" onClick={() => onRequest(match.teacher.id)} className={primary}>
        ส่งคำขออีกครั้ง
      </button>
    )
  }
  if (!c) {
    return (
      <button type="button" onClick={() => onRequest(match.teacher.id)} className={primary}>
        ส่งคำขอ
      </button>
    )
  }
  if (c.status === 'accepted') {
    return (
      <Link href="/matches?tab=contacts" className={`${box} border border-[#d4d4d4] bg-white`}>
        ดูข้อมูลติดต่อ
      </Link>
    )
  }
  if (c.status === 'declined') return <span className={muted}>ไม่สะดวกติดต่อ</span>
  if (c.direction === 'incoming') {
    return (
      <Link href="/matches?tab=contacts" className={primary}>
        ตอบกลับคำขอ
      </Link>
    )
  }
  // Figma 202:2142: cancel and the pending badge share the row 50/50.
  return (
    <div className="flex items-center gap-4">
      {onCancel && (
        <button
          type="button"
          onClick={() => onCancel(c.requestId)}
          className={`${box} min-w-0 flex-1 border border-[#d4d4d4] bg-white px-[3px]`}
        >
          ยกเลิกคำขอ
        </button>
      )}
      <span className={`${box} min-w-0 flex-1 gap-1 bg-[#fff7ed] px-[3px] text-[#c2410c]`}>
        <Image src="/acute.svg" alt="" width={24} height={24} />
        รอยืนยัน
      </span>
    </div>
  )
}

type FilterTab = 'all' | 'subject' | 'destination'

const PAGE_SIZE = 25

interface MatchListProps {
  matches: MatchResult[]
  onToggleFavorite: (teacherId: string, currentlyFavorited: boolean) => void
  onRequestContact?: (teacherId: string) => void
  onCancelContact?: (requestId: string) => void
  title?: string
  // Rendered right under the top bar (the matches page puts its ผลจับคู่ / คำขอติดต่อ switch here).
  viewTabs?: React.ReactNode
  // Dev-only controls, shown under viewTabs. They can't sit above MatchList:
  // the fixed TopBar would cover them while their height still pushes the
  // page down.
  devControls?: React.ReactNode
  showSettingsLink?: boolean
  roundLabel?: string | null
  onRefresh?: () => void
  refreshing?: boolean
}

export function MatchList({
  matches,
  onToggleFavorite,
  onRequestContact,
  onCancelContact,
  title = 'ผลการจับคู่',
  viewTabs,
  devControls,
  showSettingsLink = false,
  roundLabel = null,
  onRefresh,
  refreshing = false,
}: MatchListProps) {
  const [filterTab, setFilterTab] = useState<FilterTab>('all')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [destinationFilter, setDestinationFilter] = useState('')

  // Each option is tagged with how many current results match it, e.g.
  // "ภาษาไทย (20)" — counted against the full unfiltered list, not against
  // whatever the other filter currently narrows it to.
  const subjectOptions = useMemo(() => {
    const counts = new Map<string, number>()
    for (const m of matches) {
      if (!m.teacher.subject) continue
      counts.set(m.teacher.subject, (counts.get(m.teacher.subject) ?? 0) + 1)
    }
    return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [matches])

  const destinationOptions = useMemo(() => {
    const counts = new Map<string, number>()
    for (const m of matches) {
      for (const d of m.destinations) {
        counts.set(d.province, (counts.get(d.province) ?? 0) + 1)
      }
    }
    return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [matches])

  const filtered = useMemo(() => {
    return matches.filter((m) => {
      const subjectOk = !subjectFilter || m.teacher.subject === subjectFilter
      const destinationOk =
        !destinationFilter || m.destinations.some((d) => d.province === destinationFilter)
      return subjectOk && destinationOk
    })
  }, [matches, subjectFilter, destinationFilter])

  // Show PAGE_SIZE cards at a time; the sentinel below the list reveals more
  // as the user scrolls to it. Reset back to one page whenever the result
  // set itself changes (new filter, refreshed matches) — adjusted during
  // render rather than in an effect, per https://react.dev/learn/you-might-not-need-an-effect.
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [prevFiltered, setPrevFiltered] = useState(filtered)
  if (filtered !== prevFiltered) {
    setPrevFiltered(filtered)
    setVisibleCount(PAGE_SIZE)
  }

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  const sentinelRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!hasMore) return
    const node = sentinelRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) => prev + PAGE_SIZE)
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore])

  if (matches.length === 0) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 pb-6 text-zinc-600">
        <TopBar
          title={title}
          right={
            <>
              <RoundPill roundLabel={roundLabel} />
              {onRefresh && <RefreshButton onClick={onRefresh} refreshing={refreshing} />}
            </>
          }
        />
        {viewTabs}
        {devControls}
        <div className="mt-5 text-center">
          <p className="text-lg">ยังไม่พบคู่สับเปลี่ยนในตอนนี้</p>
          <p className="text-sm mt-1">
            ลองเพิ่มจังหวัดปลายทางให้กว้างขึ้น หรือกลับมาตรวจสอบใหม่ภายหลัง
          </p>
        </div>
      </div>
    )
  }

  function handleTabChange(tab: FilterTab) {
    setFilterTab(tab)
    // ทั้งหมด always means "no narrowing"; the other tabs each own one filter.
    if (tab !== 'subject') setSubjectFilter('')
    if (tab !== 'destination') setDestinationFilter('')
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-5 px-4 pb-6">
      <TopBar
        title={title}
        right={
          <>
            <RoundPill roundLabel={roundLabel} />
            {showSettingsLink && !roundLabel && (
              <Link href="/criteria" className="text-sm link-accent">
                ตั้งค่า
              </Link>
            )}
            {onRefresh && <RefreshButton onClick={onRefresh} refreshing={refreshing} />}
          </>
        }
      />

      {viewTabs}

      {devControls}

      <UnderlineTabs
        value={filterTab}
        onChange={handleTabChange}
        options={[
          { value: 'all', label: 'ทั้งหมด' },
          { value: 'subject', label: 'แยกตามวิชาเอก' },
          { value: 'destination', label: 'แยกตามจังหวัด' },
        ]}
      />

      {filterTab === 'subject' && (
        <select
          className="input-field"
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
        >
          <option value="">เลือกวิชาเอก</option>
          {subjectOptions.map(([s, count]) => (
            <option key={s} value={s}>
              {s} ({count})
            </option>
          ))}
        </select>
      )}
      {filterTab === 'destination' && (
        <select
          className="input-field"
          value={destinationFilter}
          onChange={(e) => setDestinationFilter(e.target.value)}
        >
          <option value="">เลือกจังหวัดปลายทาง</option>
          {destinationOptions.map(([p, count]) => (
            <option key={p} value={p}>
              {p} ({count})
            </option>
          ))}
        </select>
      )}

      {filtered.length === 0 ? (
        <p className="text-zinc-600 text-sm">
          ไม่พบผลลัพธ์ที่ตรงกับตัวกรอง ลองปรับตัวกรองให้กว้างขึ้น
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((m) => (
            <li key={m.teacher.id} className="flex flex-col gap-1 rounded-2xl bg-white p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{m.teacher.display_name}</span>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="flex h-6 items-center rounded-lg bg-zinc-100 px-[5px] text-[10px] leading-[15px]">
                    ส่งคำขอ: {m.contact ? MAX_CONTACT_SENDS - m.contact.sendsLeft : 0}/{MAX_CONTACT_SENDS}
                  </span>
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(m.teacher.id, m.favorited)}
                    aria-label={m.favorited ? 'เอาออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'}
                    className={m.favorited ? 'text-brand-red' : 'text-foreground'}
                  >
                    <HeartIcon filled={m.favorited} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-zinc-600">
                {(m.teacher.category === 'teacher' || !getRoleFields(m.teacher.category).length
                  ? [
                      positionLabel(m.teacher.position),
                      serviceTypeAbbr(m.teacher.service_type),
                      m.teacher.teaching_group ? teachingGroupLabel(m.teacher.teaching_group) : null,
                      m.teacher.subject ? subjectLabel(m.teacher.subject) : null,
                    ]
                  : cardLinesFromFields(getRoleFields(m.teacher.category), m.teacher.profile)
                )
                  .filter(Boolean)
                  .join(' · ')}
              </p>
              <p className="text-xs">
                ต้นทาง: {m.teacher.origin_province}
                {m.teacher.origin_zone ? ` ${m.teacher.origin_zone}` : ''}
                {m.teacher.origin_district ? ` (${m.teacher.origin_district})` : ''}
              </p>
              <p className="text-xs">
                ปลายทาง:{' '}
                {m.destinations.map((d) => d.province + (d.zone ? ` ${d.zone}` : '')).join(', ')}
              </p>
              {m.teacher.benefit_note && (
                <p className="flex items-center gap-2.5 text-xs text-zinc-600">
                  <HomeIcon className="size-4 shrink-0" />
                  {m.teacher.benefit_note}
                </p>
              )}
              {onRequestContact && <ContactAction match={m} onRequest={onRequestContact} onCancel={onCancelContact} />}
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-2">
          <span className="text-xs text-zinc-400">กำลังโหลดเพิ่มเติม...</span>
        </div>
      )}
    </div>
  )
}
