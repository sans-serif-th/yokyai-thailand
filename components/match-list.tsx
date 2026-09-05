'use client'

import { useMemo, useState } from 'react'
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
}

export function MatchList({ matches }: MatchListProps) {
  const [subjectFilter, setSubjectFilter] = useState('')
  const [destinationFilter, setDestinationFilter] = useState('')

  const filtered = useMemo(() => {
    return matches.filter((m) => {
      const subjectOk =
        !subjectFilter || (m.teacher.subject ?? '').toLowerCase().includes(subjectFilter.toLowerCase())
      const destinationOk =
        !destinationFilter ||
        m.destinations.some((d) => d.province.includes(destinationFilter))
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
        <input
          className="input-field text-sm"
          placeholder="กรองตามวิชาเอก"
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
        />
        <input
          className="input-field text-sm"
          placeholder="กรองตามจังหวัดปลายทาง"
          value={destinationFilter}
          onChange={(e) => setDestinationFilter(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-zinc-600 text-sm">ไม่พบผลลัพธ์ที่ตรงกับตัวกรอง ลองปรับตัวกรองให้กว้างขึ้น</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((m) => (
            <li key={m.teacher.id} className="card-surface">
              <div className="flex items-center justify-between">
                <span className="font-medium">{m.teacher.display_name}</span>
                <span className="text-xs">{TIER_LABEL[m.tier]}</span>
              </div>
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
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
