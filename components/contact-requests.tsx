'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { fetchContacts, respondContactRequest } from '@/lib/api'
import { withAuthRetry } from '@/lib/session'
import { positionLabel } from '@/lib/positions'
import { serviceTypeAbbr } from '@/lib/service-types'
import { subjectLabel } from '@/lib/subject-label'
import { teachingGroupLabel } from '@/lib/teaching-groups'
import { ConfirmDialog } from './confirm-dialog'
import { UnderlineTabs } from './underline-tabs'
import type { ContactRequestView } from '@/lib/types'

function summaryText(c: ContactRequestView) {
  return [
    positionLabel(c.summary.position as Parameters<typeof positionLabel>[0]),
    serviceTypeAbbr(c.summary.serviceType),
    c.summary.teachingGroup
      ? teachingGroupLabel(c.summary.teachingGroup as Parameters<typeof teachingGroupLabel>[0])
      : null,
    c.summary.subject ? subjectLabel(c.summary.subject) : null,
  ]
    .filter(Boolean)
    .join(' · ')
}

function originText(c: ContactRequestView) {
  const { originProvince, originZone, originDistrict } = c.summary
  return `${originProvince}${originZone ? ` ${originZone}` : ''}${originDistrict ? ` (${originDistrict})` : ''}`
}

function destinationText(c: ContactRequestView) {
  return c.summary.destinations.map((d) => d.province + (d.zone ? ` ${d.zone}` : '')).join(', ')
}

// dd/mm/yyyy hh:mm in the viewer's local time.
function sentAtText(iso: string) {
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`
}

// The "คำขอติดต่อ" tab of the matches page: requests waiting on you,
// connections you can now contact, and the ones you sent.
export function ContactRequests({
  refreshKey = 0,
  onLoaded,
}: {
  // Bumped by the page's refresh button to reload the list.
  refreshKey?: number
  onLoaded?: () => void
}) {
  const [contacts, setContacts] = useState<ContactRequestView[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const { result } = await withAuthRetry((token) => fetchContacts(token))
      setContacts(result.contacts)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      onLoaded?.()
    }
  }, [onLoaded])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
    // refreshKey is the trigger: a new value reloads the list.
  }, [load, refreshKey])

  async function respond(id: string, action: 'accept' | 'decline' | 'cancel') {
    setBusyId(id)
    try {
      await withAuthRetry((token) => respondContactRequest(token, id, action))
      await load()
    } catch (err) {
      window.alert((err as Error).message)
    } finally {
      setBusyId(null)
    }
  }

  if (error) return <p className="p-8 text-center text-terracotta">{error}</p>
  if (!contacts) {
    return (
      <div className="flex animate-pulse flex-col gap-3" role="status" aria-label="กำลังโหลด">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-zinc-200/70" />
        ))}
      </div>
    )
  }

  return <ContactRequestsView contacts={contacts} busyId={busyId} onRespond={respond} />
}

type Filter = 'all' | 'pending' | 'accepted' | 'declined'

const NOTICE_KEY = 'yokyai:contact-notice-dismissed'

const STATUS_BADGE: Record<'pending' | 'accepted' | 'declined', { label: string; className: string }> = {
  pending: { label: 'รอยืนยัน', className: 'bg-[#fff7ed] text-[#c2410c]' },
  accepted: { label: 'ยืนยันแล้ว', className: 'bg-[#f0fdf4] text-[#15803d]' },
  declined: { label: 'ปฏิเสธ', className: 'bg-[rgba(185,22,43,0.1)] text-[#c2410c]' },
}

const outlineButton =
  'flex h-8 items-center justify-center rounded-lg border border-[#d4d4d4] bg-white px-5 text-base font-bold disabled:opacity-50'

// Shown once per browser as a modal (Figma 204:1805) the first time the
// contact-requests tab is opened; "เข้าใจและยอมรับเงื่อนไข" remembers it.
function SafetyNotice({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-[rgba(23,23,23,0.5)] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="safety-notice-title"
    >
      <div className="flex max-h-[calc(100dvh-32px)] w-full max-w-[346px] flex-col gap-5 overflow-y-auto rounded-[32px] bg-background px-4 py-6">
        <div className="flex flex-col gap-[10px] py-2">
          <div className="flex flex-col">
            <p id="safety-notice-title" className="text-base font-semibold leading-6">
              โปรดอ่านก่อนติดต่อคู่จับคู่
            </p>
            <p className="text-sm leading-5 tracking-[0.14px]">
              แอปช่วยจับคู่ผู้ที่สนใจย้ายตำแหน่งเท่านั้น ไม่ได้ดำเนินการย้ายหรือประสานงานแทน
              ผู้ใช้ต้องติดต่อและประสานงานกันต่อเองนอกระบบ
            </p>
          </div>
          <div className="flex flex-col">
            <p className="text-base font-semibold leading-6">ข้อควรระวังด้านความปลอดภัย</p>
            <p className="text-sm leading-5 tracking-[0.14px]">
              <span className="font-bold text-[#b9162b]">
                ในช่วงทดสอบระบบ แอปยังไม่มีระบบยืนยันตัวตนผู้ใช้งาน{' '}
              </span>
              <span className="font-bold">
                โปรดตรวจสอบตัวตนของคู่ให้แน่ใจก่อนติดต่อหรือแลกเปลี่ยนข้อมูลสำคัญใดๆ{' '}
              </span>
              และหลีกเลี่ยงการเปิดเผยข้อมูลส่วนบุคคลที่มีความเสี่ยง
              <br />
              <br />
              เรามีแผนพัฒนาระบบยืนยันตัวตนเพื่อเพิ่มความน่าเชื่อถือและความปลอดภัยในการใช้งานในอนาคต
            </p>
          </div>
        </div>
        <button type="button" onClick={onDismiss} className="btn-brand-primary w-full">
          เข้าใจและยอมรับเงื่อนไข
        </button>
      </div>
    </div>
  )
}

// Presentational half, split out so the tab can be previewed with mock data.
export function ContactRequestsView({
  contacts,
  busyId,
  onRespond: respond,
}: {
  contacts: ContactRequestView[]
  busyId: string | null
  onRespond: (id: string, action: 'accept' | 'decline' | 'cancel') => void
}) {
  const [filter, setFilter] = useState<Filter>('all')
  // Request awaiting the "delete this connection" confirmation.
  const [deleteId, setDeleteId] = useState<string | null>(null)
  // Remembered per browser; starts dismissed so a returning user never sees it flash.
  const [noticeDismissed, setNoticeDismissed] = useState(true)
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNoticeDismissed(localStorage.getItem(NOTICE_KEY) === '1')
    } catch {
      setNoticeDismissed(false)
    }
  }, [])

  function dismissNotice() {
    setNoticeDismissed(true)
    try {
      localStorage.setItem(NOTICE_KEY, '1')
    } catch {
      // storage blocked: the notice just comes back next visit
    }
  }

  // Cancelled requests aren't listed here — they reappear on the match card,
  // where the requester can send again.
  const listed = contacts.filter(
    (c): c is ContactRequestView & { status: 'pending' | 'accepted' | 'declined' } =>
      c.status !== 'cancelled'
  )
  const shown = filter === 'all' ? listed : listed.filter((c) => c.status === filter)

  return (
    <div className="flex flex-col gap-5">
      <UnderlineTabs<Filter>
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: 'ทั้งหมด' },
          { value: 'pending', label: 'รอยืนยัน' },
          { value: 'accepted', label: 'ยืนยันแล้ว' },
          { value: 'declined', label: 'ปฏิเสธ' },
        ]}
      />

      {!noticeDismissed && <SafetyNotice onDismiss={dismissNotice} />}

      {shown.length === 0 && (
        <p className="py-8 text-center text-zinc-600">
          {listed.length === 0
            ? 'ยังไม่มีคำขอติดต่อ กด “ส่งคำขอ” ที่การ์ดคู่ในหน้าผลจับคู่เพื่อเริ่ม'
            : 'ไม่มีรายการในหมวดนี้'}
        </p>
      )}

      {shown.map((c) => {
        const badge = STATUS_BADGE[c.status]
        const busy = busyId === c.id
        const incomingPending = c.status === 'pending' && c.direction === 'incoming'
        return (
          <div key={c.id} className="flex flex-col gap-4 rounded-2xl bg-white p-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold leading-[21px]">{c.name ?? c.maskedName}</span>
                <span className={`flex h-6 items-center rounded-lg px-[5px] text-[10px] leading-[15px] ${badge.className}`}>
                  {badge.label}
                </span>
              </div>
              <p className="text-sm leading-5 tracking-[0.14px] text-zinc-600">{summaryText(c)}</p>
              <p className="text-sm leading-5 tracking-[0.14px]">ต้นทาง: {originText(c)}</p>
              <p className="text-sm leading-5 tracking-[0.14px]">ปลายทาง: {destinationText(c)}</p>
            </div>

            {incomingPending && (
              <div className="flex items-center gap-4">
                <button type="button" disabled={busy} onClick={() => respond(c.id, 'decline')} className={outlineButton}>
                  ปฏิเสธ
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => respond(c.id, 'accept')}
                  className="flex h-8 min-w-0 flex-1 items-center justify-center rounded-lg bg-brand-red px-5 text-base font-bold text-white disabled:opacity-50"
                >
                  ยืนยันให้ช่องทางการติดต่อ
                </button>
              </div>
            )}

            {c.status === 'accepted' && (
              <>
                {c.lineId && (
                  <a
                    href={`https://line.me/ti/p/~${c.lineId.replace(/^@/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 items-center gap-1 rounded-lg border border-[#d4d4d4] bg-white px-3 text-xs font-bold text-zinc-600"
                  >
                    <Image src="/line-icon.png" alt="" width={16} height={16} />
                    <span className="min-w-0 flex-1 truncate">LINE ID: {c.lineId}</span>
                    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden className="shrink-0">
                      <path d="M10 17l5-5-5-5v10z" fill="currentColor" />
                    </svg>
                  </a>
                )}
                {c.phone && (
                  <a href={`tel:${c.phone}`} className="w-fit text-xs link-accent">
                    โทร {c.phone}
                  </a>
                )}
              </>
            )}

            <div className="flex items-center justify-between text-[10px] leading-[15px]">
              <span>ส่งเมื่อ: {sentAtText(c.createdAt)}</span>
              {c.status === 'accepted' && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setDeleteId(c.id)}
                  className="underline"
                >
                  ลบรายชื่อนี้จากผลการจับคู่
                </button>
              )}
              {c.status === 'pending' && c.direction === 'outgoing' && (
                <button type="button" disabled={busy} onClick={() => respond(c.id, 'cancel')} className="underline">
                  ยกเลิกคำขอ
                </button>
              )}
            </div>
          </div>
        )
      })}

      <ConfirmDialog
        open={deleteId !== null}
        title="ยืนยันการลบรายชื่อ?"
        message="เมื่อลบรายชื่อ ทั้งคุณและอีกฝ่ายจะไม่เห็นข้อมูลติดต่อของกันอีก ต้องทำการส่งคำขอใหม่เพื่อดูข้อมูลติดต่ออีกครั้ง"
        confirmLabel="ลบ"
        destructive
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) respond(deleteId, 'cancel')
          setDeleteId(null)
        }}
      />
    </div>
  )
}
