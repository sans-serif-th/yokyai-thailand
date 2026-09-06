'use client'

import { useMemo, useState } from 'react'
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

interface MatchListProps {
  matches: MatchResult[]
  onToggleFavorite: (teacherId: string, currentlyFavorited: boolean) => void
}

export function MatchList({ matches, onToggleFavorite }: MatchListProps) {
  const [subjectFilter, setSubjectFilter] = useState('')
  const [destinationFilter, setDestinationFilter] = useState('')

  const subjectOptions = useMemo(() => {
    const values = new Set(matches.map((m) => m.teacher.subject).filter((s): s is string => !!s))
    return [...values].sort()
  }, [matches])

  const destinationOptions = useMemo(() => {
    const values = new Set(matches.flatMap((m) => m.destinations.map((d) => d.province)))
    return [...values].sort()
  }, [matches])

  const filtered = useMemo(() => {
    return matches.filter((m) => {
      const subjectOk = !subjectFilter || m.teacher.subject === subjectFilter
      const destinationOk =
        !destinationFilter || m.destinations.some((d) => d.province === destinationFilter)
      return subjectOk && destinationOk
    })
  }, [matches, subjectFilter, destinationFilter])

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
      <h1 className="text-xl font-semibold">ผลการจับคู่</h1>

      <div className="grid grid-cols-2 gap-2">
        <select
          className="input-field text-sm"
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
        >
          <option value="">วิชาเอกทั้งหมด</option>
          {subjectOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className="input-field text-sm"
          value={destinationFilter}
          onChange={(e) => setDestinationFilter(e.target.value)}
        >
          <option value="">จังหวัดปลายทางทั้งหมด</option>
          {destinationOptions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-zinc-600 text-sm">ไม่พบผลลัพธ์ที่ตรงกับตัวกรอง ลองปรับตัวกรองให้กว้างขึ้น</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((m) => (
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
              {m.teacher.source === 'facebook_import' && (
                <span className="inline-block text-xs text-zinc-500 bg-zinc-100 rounded-full px-2 py-0.5 mt-1">
                  ข้อมูลนำเข้า
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
    </div>
  )
}
