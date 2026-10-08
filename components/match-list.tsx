'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { HeartIcon, HomeIcon } from './icons'
import { RoundPill } from './round-pill'
import { SegmentedTabs } from './segmented-tabs'
import { positionLabel } from '@/lib/positions'
import { serviceTypeAbbr } from '@/lib/service-types'
import { teachingGroupLabel } from '@/lib/teaching-groups'
import type { MatchResult } from '@/lib/types'

const TIER_BADGE: Record<MatchResult['tier'], { label: string; className: string }> = {
  perfect: { label: 'ตรงที่สุด', className: 'bg-[#f0fdf4] text-[#15803d]' },
  high: { label: 'ตรงวิชาเอก', className: 'bg-[#fff7ed] text-[#c2410c]' },
  partial: { label: 'ตรงตำแหน่ง', className: 'bg-zinc-100 text-zinc-600' },
}

type FilterTab = 'all' | 'subject' | 'destination'

const PAGE_SIZE = 25

interface MatchListProps {
  matches: MatchResult[]
  onToggleFavorite: (teacherId: string, currentlyFavorited: boolean) => void
  title?: string
  showSettingsLink?: boolean
  roundLabel?: string | null
}

export function MatchList({
  matches,
  onToggleFavorite,
  title = 'ผลการจับคู่',
  showSettingsLink = false,
  roundLabel = null,
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
      <div className="max-w-lg mx-auto p-4 text-center text-zinc-600">
        <p className="text-lg">ยังไม่พบคู่สับเปลี่ยนในตอนนี้</p>
        <p className="text-sm mt-1">
          ลองเพิ่มจังหวัดปลายทางให้กว้างขึ้น หรือกลับมาตรวจสอบใหม่ภายหลัง
        </p>
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
    <div className="mx-auto flex w-full max-w-lg flex-col gap-5 px-4 py-6">
      <div className="flex items-center gap-2 py-2">
        <h1 className="flex-1 text-xl font-bold">{title}</h1>
        <RoundPill roundLabel={roundLabel} />
        {showSettingsLink && !roundLabel && (
          <Link href="/criteria" className="text-sm link-accent">
            ตั้งค่า
          </Link>
        )}
      </div>

      <SegmentedTabs
        value={filterTab}
        onChange={handleTabChange}
        options={[
          { value: 'all', label: 'ทั้งหมด' },
          { value: 'subject', label: 'วิชาเอก' },
          { value: 'destination', label: 'จังหวัด' },
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
                  <span
                    className={`rounded-lg px-2 py-1 text-[10px] leading-[15px] ${TIER_BADGE[m.tier].className}`}
                  >
                    {TIER_BADGE[m.tier].label}
                  </span>
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(m.teacher.id, m.favorited)}
                    aria-label={m.favorited ? 'เอาออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'}
                    className={m.favorited ? 'text-brand-red' : 'text-zinc-400'}
                  >
                    <HeartIcon filled={m.favorited} />
                  </button>
                </div>
              </div>
              {m.teacher.claimed_at && (
                <span className="inline-block w-fit rounded-full bg-sage/20 px-2 py-0.5 text-[10px] text-sage-dark">
                  ✓ ยืนยันตัวตน
                </span>
              )}
              <p className="text-xs text-zinc-600">
                {[
                  positionLabel(m.teacher.position),
                  serviceTypeAbbr(m.teacher.service_type),
                  m.teacher.teaching_group ? teachingGroupLabel(m.teacher.teaching_group) : null,
                  m.teacher.subject ? `เอก${m.teacher.subject}` : null,
                ]
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
              {m.teacher.facebook_url && (
                <a
                  href={m.teacher.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-fit text-xs link-accent"
                >
                  ติดต่อผ่าน Facebook
                </a>
              )}
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
