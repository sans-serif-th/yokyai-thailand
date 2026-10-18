'use client'

import { useCallback, useEffect, useState } from 'react'
import { fetchContacts, respondContactRequest } from '@/lib/api'
import { withAuthRetry } from '@/lib/session'
import { positionLabel } from '@/lib/positions'
import { teachingGroupLabel } from '@/lib/teaching-groups'
import type { ContactRequestView } from '@/lib/types'

function summaryText(c: ContactRequestView) {
  return [
    positionLabel(c.summary.position as Parameters<typeof positionLabel>[0]),
    c.summary.teachingGroup
      ? teachingGroupLabel(c.summary.teachingGroup as Parameters<typeof teachingGroupLabel>[0])
      : null,
    `ต้นทาง ${c.summary.originProvince}`,
  ]
    .filter(Boolean)
    .join(' · ')
}

// The "คำขอติดต่อ" tab of the matches page: requests waiting on you,
// connections you can now contact, and the ones you sent.
export function ContactRequests() {
  const [contacts, setContacts] = useState<ContactRequestView[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const { result } = await withAuthRetry((token) => fetchContacts(token))
      setContacts(result.contacts)
    } catch (err) {
      setError((err as Error).message)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

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

  const incoming = contacts.filter((c) => c.direction === 'incoming' && c.status === 'pending')
  const connected = contacts.filter((c) => c.status === 'accepted')
  const sent = contacts.filter((c) => c.direction === 'outgoing' && c.status !== 'accepted')

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs text-zinc-500">
        ชื่อและ LINE ID จะแสดงให้ทั้งสองฝ่ายเห็นก็ต่อเมื่ออีกฝ่ายกดยอมรับเท่านั้น
      </p>

      {contacts.length === 0 && (
        <p className="py-8 text-center text-zinc-600">
          ยังไม่มีคำขอติดต่อ กด “ขอติดต่อ” ที่การ์ดคู่ในหน้าค้นหาเพื่อเริ่ม
        </p>
      )}

      {incoming.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold">รอคุณตอบ</h2>
          {incoming.map((c) => (
            <div key={c.id} className="flex flex-col gap-2 rounded-2xl bg-white p-3">
              <span className="text-sm font-semibold">{c.maskedName}</span>
              <p className="text-xs text-zinc-600">{summaryText(c)}</p>
              <p className="text-xs text-zinc-500">
                ถ้ายอมรับ เขาจะเห็นชื่อและ LINE ID ของคุณ และคุณจะเห็นของเขา
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={busyId === c.id}
                  onClick={() => respond(c.id, 'decline')}
                  className="btn-brand-secondary h-[36px] flex-1 rounded-lg text-xs"
                >
                  ปฏิเสธ
                </button>
                <button
                  type="button"
                  disabled={busyId === c.id}
                  onClick={() => respond(c.id, 'accept')}
                  className="btn-brand-primary h-[36px] flex-1 rounded-lg border border-transparent py-0 text-xs"
                >
                  ยอมรับ
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {connected.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold">เชื่อมต่อแล้ว</h2>
          {connected.map((c) => (
            <div key={c.id} className="flex flex-col gap-1 rounded-2xl bg-white p-3">
              <span className="text-sm font-semibold">{c.name}</span>
              <p className="text-xs text-zinc-600">{summaryText(c)}</p>
              {c.lineId && (
                <a
                  href={`https://line.me/ti/p/~${c.lineId.replace(/^@/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-fit text-sm link-accent"
                >
                  LINE ID: {c.lineId}
                </a>
              )}
              {c.phone && (
                <a href={`tel:${c.phone}`} className="w-fit text-xs link-accent">
                  โทร {c.phone}
                </a>
              )}
            </div>
          ))}
        </section>
      )}

      {sent.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold">คำขอที่คุณส่ง</h2>
          {sent.map((c) => (
            <div key={c.id} className="flex flex-col gap-1 rounded-2xl bg-white p-3">
              <span className="text-sm font-semibold">{c.maskedName}</span>
              <p className="text-xs text-zinc-600">{summaryText(c)}</p>
              <p className="text-xs text-zinc-500">
                {c.status === 'pending'
                  ? 'รออีกฝ่ายตอบ'
                  : c.status === 'cancelled'
                    ? 'ยกเลิกคำขอแล้ว'
                    : 'อีกฝ่ายไม่สะดวกติดต่อ'}
              </p>
              {c.status === 'pending' && (
                <button
                  type="button"
                  disabled={busyId === c.id}
                  onClick={() => respond(c.id, 'cancel')}
                  className="w-fit text-xs text-zinc-500 underline"
                >
                  ยกเลิกคำขอ
                </button>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
