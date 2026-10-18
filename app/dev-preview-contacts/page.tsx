'use client'

// TEMPORARY mock of the whole matches page (ผลจับคู่ + คำขอติดต่อ tabs) —
// mock data only, no auth, no network. Not committed.
import { useState } from 'react'
import { ContactRequestsView } from '@/components/contact-requests'
import { MatchList } from '@/components/match-list'
import { RoundPill } from '@/components/round-pill'
import { SegmentedTabs } from '@/components/segmented-tabs'
import { TopBar } from '@/components/top-bar'
import type { ContactRequestView, Destination, MatchResult, Teacher } from '@/lib/types'

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

function match(n: number, tier: MatchResult['tier'], over: Partial<Teacher>, contact?: MatchResult['contact']): MatchResult {
  return { teacher: teacher(n, over), destinations: [dest(n, 'เชียงใหม่')], tier, favorited: false, contact }
}

const MATCHES: MatchResult[] = [
  match(1, 'perfect', { subject: 'เอกคณิตศาสตร์', display_name: 'ส***** ใ*****', benefit_note: 'มีบ้านพักครู' }),
  match(2, 'high', { subject: 'เอกคณิตศาสตร์', origin_district: 'เขตจตุจักร' }, { requestId: 'r2', status: 'pending', direction: 'outgoing', sendsLeft: 2 }),
  match(3, 'partial', { origin_district: 'เขตบางกะปิ', display_name: 'ม***** ร*****' }, { requestId: 'r3', status: 'accepted', direction: 'outgoing', sendsLeft: 3 }),
  match(4, 'partial', { origin_district: 'เขตดุสิต' }, { requestId: 'r4', status: 'cancelled', direction: 'outgoing', sendsLeft: 1 }),
  match(5, 'partial', { origin_district: 'เขตบางรัก' }, { requestId: 'r5', status: 'cancelled', direction: 'outgoing', sendsLeft: 0 }),
]

const base = {
  createdAt: '2026-10-18T00:00:00Z',
  summary: { position: 'teacher', teachingGroup: 'math', originProvince: 'กรุงเทพมหานคร' },
  name: null,
  lineId: null,
  phone: null,
  sendsLeft: 3,
}

const CONTACTS: ContactRequestView[] = [
  { ...base, id: '1', teacherId: 't1', status: 'pending', direction: 'incoming', maskedName: 'ส***** ใ*****' },
  { ...base, id: '2', teacherId: 't2', status: 'accepted', direction: 'outgoing', maskedName: 'ม***** ศ*****', name: 'มานะ ศรีสุข', lineId: 'mana.s', phone: '081-234-5678' },
  { ...base, id: '3', teacherId: 't3', status: 'pending', direction: 'outgoing', maskedName: 'ก***** ว*****', sendsLeft: 2 },
  { ...base, id: '4', teacherId: 't4', status: 'cancelled', direction: 'outgoing', maskedName: 'ป***** ร*****', sendsLeft: 1 },
  { ...base, id: '5', teacherId: 't5', status: 'declined', direction: 'outgoing', maskedName: 'ว***** ท*****' },
]

type Tab = 'matches' | 'contacts'

export default function DevPreviewContacts() {
  const [tab, setTab] = useState<Tab>('matches')
  const [matches, setMatches] = useState(MATCHES)
  const [emptyContacts, setEmptyContacts] = useState(false)

  const viewTabs = (
    <SegmentedTabs<Tab>
      value={tab}
      onChange={setTab}
      options={[
        { value: 'matches', label: 'ผลจับคู่' },
        { value: 'contacts', label: 'คำขอติดต่อ' },
      ]}
    />
  )

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex-1 pb-24">
        {tab === 'contacts' ? (
          <div className="mx-auto flex w-full max-w-lg flex-col gap-5 px-4 pb-6">
            <TopBar title="ผลการจับคู่" right={<RoundPill roundLabel="1/2570" />} />
            {viewTabs}
            <label className="text-xs text-zinc-500">
              <input type="checkbox" checked={emptyContacts} onChange={(e) => setEmptyContacts(e.target.checked)} /> mock: ไม่มีคำขอ
            </label>
            <ContactRequestsView contacts={emptyContacts ? [] : CONTACTS} busyId={null} onRespond={() => {}} />
          </div>
        ) : (
          <MatchList
            viewTabs={viewTabs}
            matches={matches}
            onToggleFavorite={(id, cur) =>
              setMatches((p) => p.map((m) => (m.teacher.id === id ? { ...m, favorited: !cur } : m)))
            }
            onRequestContact={() => {}}
            onCancelContact={() => {}}
            showSettingsLink
            roundLabel="1/2570"
          />
        )}
      </div>
      <div className="fixed inset-x-0 bottom-0 h-[88px] rounded-t-[30px] bg-white shadow" />
    </div>
  )
}
