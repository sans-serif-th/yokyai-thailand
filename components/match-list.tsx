'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { HeartIcon } from './icons'
import { positionLabel } from '@/lib/positions'
import { serviceTypeAbbr } from '@/lib/service-types'
import { teachingGroupLabel } from '@/lib/teaching-groups'
import type { MatchResult } from '@/lib/types'

const TIER_LABEL: Record<MatchResult['tier'], string> = {
  perfect: '✅ ตรงที่สุด',
  high: '🟡 ตรงวิชาเอก',
  partial: '⚪ ตรงตำแหน่ง',
}

const PAGE_SIZE = 15

interface MatchListProps {
  matches: MatchResult[]
  onToggleFavorite: (teacherId: string, currentlyFavorited: boolean) => void
  title?: string
  showSettingsLink?: boolean
}

export function MatchList({
  matches,
  onToggleFavorite,
  title = 'ผลการจับคู่',
  showSettingsLink = false,
}: MatchListProps) {
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

  return (
    <div className="max-w-lg mx-auto p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{title}</h1>
        {showSettingsLink && (
          <Link href="/criteria" className="text-sm link-accent">
            ตั้งค่า
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <select
          className="input-field text-sm"
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
        >
          <option value="">วิชาเอกทั้งหมด</option>
          {subjectOptions.map(([s, count]) => (
            <option key={s} value={s}>
              {s} ({count})
            </option>
          ))}
        </select>
        <select
          className="input-field text-sm"
          value={destinationFilter}
          onChange={(e) => setDestinationFilter(e.target.value)}
        >
          <option value="">จังหวัดปลายทางทั้งหมด</option>
          {destinationOptions.map(([p, count]) => (
            <option key={p} value={p}>
              {p} ({count})
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-zinc-600 text-sm">ไม่พบผลลัพธ์ที่ตรงกับตัวกรอง ลองปรับตัวกรองให้กว้างขึ้น</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((m) => (
            <li key={m.teacher.id} className="card-surface">
              <div className="flex items-center justify-between">
                <span className="font-medium">{m.teacher.display_name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs">{TIER_LABEL[m.tier]}</span>
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(m.teacher.id, m.favorited)}
                    aria-label={m.favorited ? 'เอาออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'}
                    className={m.favorited ? 'text-terracotta' : 'text-zinc-400'}
                  >
                    <HeartIcon filled={m.favorited} />
                  </button>
                </div>
              </div>
              {m.teacher.claimed_at && (
                <span className="inline-block text-xs text-green-600 bg-green-50 rounded-full px-2 py-0.5 mt-1">
                  ✓ ยืนยันตัวตน
                </span>
              )}
              <p className="text-sm text-zinc-600">
                {positionLabel(m.teacher.position)} · {serviceTypeAbbr(m.teacher.service_type)}
                {m.teacher.teaching_group ? ` · ${teachingGroupLabel(m.teacher.teaching_group)}` : ''}
                {m.teacher.subject ? ` · ${m.teacher.subject}` : ''}
              </p>
              <p className="text-sm mt-1">
                ต้นทาง: {m.teacher.origin_province}
                {m.teacher.origin_zone ? ` ${m.teacher.origin_zone}` : ''}
                {m.teacher.origin_district ? ` (${m.teacher.origin_district})` : ''}
              </p>
              <p className="text-sm">
                ปลายทาง:{' '}
                {m.destinations
                  .map((d) => d.province + (d.zone ? ` ${d.zone}` : ''))
                  .join(', ')}
              </p>
              {m.teacher.benefit_note && (
                <p className="text-sm text-zinc-500 mt-1">💡 {m.teacher.benefit_note}</p>
              )}
              {m.teacher.facebook_url && (
                <a
                  href={m.teacher.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm link-accent mt-1 inline-block"
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
