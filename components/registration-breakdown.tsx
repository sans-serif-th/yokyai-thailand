import Image from 'next/image'
import { useState } from 'react'
import type { RegistrationBreakdown } from '@/lib/types'
import { BarChartIcon, ChevronRightIcon } from './icons'
import { RoundPill } from './round-pill'
import { SegmentedTabs } from './segmented-tabs'

type BreakdownTab = 'origin' | 'destination' | 'subject'

interface RegistrationBreakdownViewProps {
  breakdown: RegistrationBreakdown
  roundLabel: string | null
}

function formatNumber(n: number) {
  return n.toLocaleString('th-TH')
}

const VISIBLE_ROWS = 15

function RankedList({ title, rows }: { title: string; rows: { label: string; count: number }[] }) {
  const [showAll, setShowAll] = useState(false)
  const maxCount = Math.max(1, ...rows.map((r) => r.count))
  const shown = showAll ? rows : rows.slice(0, VISIBLE_ROWS)
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-white p-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">{title}</h2>
        {rows.length > VISIBLE_ROWS && (
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="flex items-center gap-2 text-xs"
          >
            {showAll ? 'ย่อ' : 'ดูทั้งหมด'}
            <ChevronRightIcon className={showAll ? '-rotate-90' : 'rotate-90'} />
          </button>
        )}
      </div>
      {rows.length === 0 ? (
        <p className="text-xs text-zinc-500">ยังไม่มีข้อมูล</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {shown.map((r, i) => (
            <li key={r.label} className="flex items-center gap-2.5">
              <span className="flex w-[17px] shrink-0 items-center justify-center rounded-full bg-background text-xs text-zinc-600">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-xs">{r.label}</span>
              <span className="flex h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
                <span
                  className="block h-full rounded-full bg-brand-red"
                  style={{ width: `${(r.count / maxCount) * 100}%` }}
                />
              </span>
              <span className="w-6 shrink-0 text-right text-[10px] text-zinc-500">
                {formatNumber(r.count)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// Shown on the matches/favorites tabs in place of match results while the
// active round is still in its registration phase (see lib/rounds.ts) —
// mirrors exactly where the old per-user queue-waiting screen used to
// render. Profile/criteria stay fully reachable via the bottom nav
// regardless — this only replaces the search-results body of these tabs.
export function RegistrationBreakdownView({
  breakdown,
  roundLabel,
}: RegistrationBreakdownViewProps) {
  const [tab, setTab] = useState<BreakdownTab>('origin')

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-5 px-4 py-6">
      <div className="flex items-center gap-2 py-2">
        <h1 className="flex-1 text-xl font-bold">ผลการจับคู่</h1>
        <RoundPill roundLabel={roundLabel} />
      </div>

      <div className="relative overflow-hidden rounded-3xl px-4 py-8">
        <Image src="/registration-status-bg.png" alt="" fill className="object-cover" priority />
        <div className="relative z-10 flex items-start justify-center gap-2">
          <span className="flex shrink-0 items-center justify-center rounded-full bg-white p-1 text-brand-red">
            <BarChartIcon />
          </span>
          <div className="flex flex-col text-white">
            <p className="text-[14px] font-semibold">ยังอยู่ในช่วงลงทะเบียน</p>
            <p className="text-xs">
              ระบบจะเปิดให้ดูผลการจับคู่
              <br />
              เมื่อถึงเวลาที่กำหนด{roundLabel && ` (รอบ ${roundLabel})`}
            </p>
          </div>
        </div>
        <p className="relative z-10 mt-2 text-center text-white">
          <span className="text-[38px] font-medium tracking-tight">
            {formatNumber(breakdown.totalRegistered)}
          </span>{' '}
          <span className="text-sm">คนลงทะเบียนแล้ว</span>
        </p>
      </div>

      <SegmentedTabs
        compact
        value={tab}
        onChange={setTab}
        options={[
          { value: 'origin', label: 'จังหวัดต้นทาง' },
          { value: 'destination', label: 'จังหวัดปลายทาง' },
          { value: 'subject', label: 'วิชาเอก' },
        ]}
      />

      {tab === 'origin' && (
        <RankedList
          title="แยกตามจังหวัดต้นทาง"
          rows={breakdown.byOriginProvince.map((r) => ({ label: r.province, count: r.count }))}
        />
      )}
      {tab === 'destination' && (
        <RankedList
          title="แยกตามจังหวัดปลายทาง"
          rows={breakdown.byDestinationProvince.map((r) => ({ label: r.province, count: r.count }))}
        />
      )}
      {tab === 'subject' && (
        <RankedList
          title="แยกตามวิชาเอก"
          rows={breakdown.bySubject.map((r) => ({ label: r.subject, count: r.count }))}
        />
      )}
    </div>
  )
}
