'use client'

// TEMPORARY mock of the matches screen — mock data only, no auth, no network.
// Delete this folder before committing.
import { useState } from 'react'
import { MatchList } from '@/components/match-list'
import { SegmentedTabs } from '@/components/segmented-tabs'
import type { Destination, MatchResult, Teacher } from '@/lib/types'

function teacher(n: number, over: Partial<Teacher>): Teacher {
  return {
    id: `mock-${n}`,
    line_user_id: `mock-${n}`,
    display_name: 'ท***** ห*****',
    position: 'teacher',
    service_type: 'primary',
    origin_province: 'กรุงเทพมหานคร',
    origin_district: 'เขตพญาไท',
    origin_zone: null,
    current_school: null,
    teaching_group: 'math',
    subject: null,
    benefit_note: null,
    transfer_round: '1',
    transfer_year: 2027,
    facebook_url: null,
    phone: null,
    line_id: null,
    source: 'app',
    invite_code: null,
    claimed_at: '2026-10-01T00:00:00Z',
    category: 'teacher',
    admin_status: 'new',
    ...over,
  }
}

function dest(n: number, province: string): Destination {
  return { id: `d-${n}`, teacher_id: `mock-${n}`, province, district: null, zone: null }
}

function match(n: number, tier: MatchResult['tier'], over: Partial<Teacher>, to = 'เชียงใหม่') {
  return { teacher: teacher(n, over), destinations: [dest(n, to)], tier, favorited: false }
}

const REAL: MatchResult[] = [
  match(1, 'perfect', { subject: 'เอกคณิตศาสตร์', display_name: 'ส***** ใ*****', benefit_note: 'มีบ้านพักครู' }),
  { ...match(2, 'high', { subject: 'เอกคณิตศาสตร์', origin_district: 'เขตจตุจักร' }), contact: { requestId: 'r2', status: 'pending' as const, direction: 'outgoing' as const } },
  { ...match(3, 'partial', { origin_district: 'เขตบางกะปิ', display_name: 'ม***** ร*****' }), contact: { requestId: 'r3', status: 'accepted' as const, direction: 'incoming' as const } },
]

const IMPORTED: MatchResult[] = [
  match(11, 'partial', { source: 'facebook_import', claimed_at: null, subject: 'เอกคณิตศาสตร์' }),
  match(12, 'partial', { source: 'facebook_import', claimed_at: null, subject: 'เอกพลศึกษา', teaching_group: 'health_pe' }, 'ตรัง'),
  match(13, 'partial', { source: 'facebook_import', claimed_at: null, subject: 'เอกภาษาอังกฤษ', teaching_group: 'foreign_lang' }, 'มุกดาหาร'),
]

export default function DevPreviewTmp() {
  const [scenario, setScenario] = useState<'results' | 'empty'>('results')
  const [devMode, setDevMode] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [refreshCount, setRefreshCount] = useState(0)
  const [real, setReal] = useState(REAL)
  const [imported, setImported] = useState(IMPORTED)

  function toggleFav(id: string, cur: boolean) {
    const flip = (p: MatchResult[]) =>
      p.map((m) => (m.teacher.id === id ? { ...m, favorited: !cur } : m))
    setReal(flip)
    setImported(flip)
  }

  function refresh() {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
      setRefreshCount((c) => c + 1)
    }, 1200)
  }

  const shown = devMode ? imported : scenario === 'empty' ? [] : real

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex-1 pb-24">
        <div className="fixed inset-x-0 bottom-24 z-30 mx-auto flex w-fit flex-wrap items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs text-zinc-600 shadow">
          <span>mock:</span>
          <button className="rounded-full border px-2 py-1" onClick={() => setScenario('results')}>
            มีผลจับคู่
          </button>
          <button className="rounded-full border px-2 py-1" onClick={() => setScenario('empty')}>
            ไม่พบคู่
          </button>
          <span>refresh x{refreshCount}</span>
        </div>
        <div className="flex flex-col gap-2">
          <div className="max-w-lg mx-auto w-full px-4 pt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setDevMode((v) => !v)}
              className="text-xs rounded-full px-3 py-1 border border-dashed border-zinc-400 text-zinc-600 bg-zinc-50"
            >
              {devMode ? '🔧 ออกจากโหมดทดสอบ' : '🔧 โหมดทดสอบ: ดูข้อมูลนำเข้าทั้งหมด'}
            </button>
          </div>
          {devMode && (
            <p className="max-w-lg mx-auto w-full px-4 text-xs text-zinc-500">
              กำลังแสดงข้อมูลนำเข้าทั้งหมด (ไม่ผ่านเงื่อนไขการจับคู่จริง) — สำหรับทดสอบเท่านั้น
            </p>
          )}
          <MatchList
            viewTabs={<SegmentedTabs value="matches" onChange={() => {}} options={[{ value: 'matches', label: 'ผลจับคู่' }, { value: 'contacts', label: 'คำขอติดต่อ' }]} />}
            matches={shown}
            onToggleFavorite={toggleFav}
            onRequestContact={(id) =>
              setReal((p) => p.map((m) => (m.teacher.id === id ? { ...m, contact: { requestId: 'x', status: 'pending' as const, direction: 'outgoing' as const } } : m)))
            }
            showSettingsLink
            roundLabel="1/2570"
            onRefresh={refresh}
            refreshing={refreshing}
          />
        </div>
      </div>
      {/* BottomNav itself calls LIFF login on mount, so it is left out here. */}
      <div className="fixed inset-x-0 bottom-0 h-[88px] rounded-t-[30px] bg-white shadow" />
    </div>
  )
}
