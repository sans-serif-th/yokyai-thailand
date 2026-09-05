'use client'

import { useMemo, useState } from 'react'
import { teachingGroupLabel } from '@/lib/teaching-groups'
import type { MatchResult } from '@/lib/types'

const TIER_LABEL: Record<MatchResult['tier'], string> = {
  perfect: '✅ ตรงที่สุด (Perfect match)',
  high: '🟡 ตรงวิชาเอก (Subject match)',
  partial: '⚪ ตรงกลุ่มสาระ (Group match)',
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
          No matches yet. Try widening your search — add more destination provinces, or check
          back later as more teachers register.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto p-4 flex flex-col gap-4">
      <h1 className="text-xl font-semibold">ผลการจับคู่ (Matches)</h1>

      <div className="grid grid-cols-2 gap-2">
        <input
          className="border rounded px-3 py-2 text-sm"
          placeholder="กรองตามวิชาเอก (filter by subject)"
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
        />
        <input
          className="border rounded px-3 py-2 text-sm"
          placeholder="กรองตามจังหวัดปลายทาง (filter by destination)"
          value={destinationFilter}
          onChange={(e) => setDestinationFilter(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-zinc-600 text-sm">No matches fit that filter — try broadening it.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((m) => (
            <li key={m.teacher.id} className="border rounded p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{m.teacher.display_name}</span>
                <span className="text-xs">{TIER_LABEL[m.tier]}</span>
              </div>
              <p className="text-sm text-zinc-600">
                {teachingGroupLabel(m.teacher.teaching_group)}
                {m.teacher.subject ? ` · ${m.teacher.subject}` : ''}
              </p>
              <p className="text-sm mt-1">
                ต้นทาง: {m.teacher.origin_province}
                {m.teacher.origin_district ? ` (${m.teacher.origin_district})` : ''}
              </p>
              <p className="text-sm">
                ปลายทาง: {m.destinations.map((d) => d.province).join(', ')}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
