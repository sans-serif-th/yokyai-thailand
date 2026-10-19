'use client'

import { useCallback, useEffect, useState } from 'react'
import { roundPhase, type RoundPhase } from '@/lib/round-phase'
import type { Round } from '@/lib/types'

const PHASE_LABEL: Record<RoundPhase, string> = {
  registration: '🟡 ช่วงลงทะเบียน',
  matching: '🟢 เปิดจับคู่',
  closed: '🔴 ปิดจับคู่แล้ว',
}

function toDatetimeLocal(iso: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function toIso(local: string) {
  return local ? new Date(local).toISOString() : null
}

function formatDate(iso: string | null) {
  if (!iso) return '–'
  return new Date(iso).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })
}

interface Draft {
  label: string
  opens: string
  closes: string
}

const EMPTY_DRAFT: Draft = { label: '', opens: '', closes: '' }

// One role's matching rounds: which one is active now, and the open/close
// dates of each (see lib/rounds.ts roundPhase). `onActiveChange` lets the
// dashboard show the active round's phase on its tab.
export function RoundPanel({
  token,
  role,
  roleName,
  onActiveChange,
}: {
  token: string
  role: string
  roleName: string
  onActiveChange: (round: Round | null) => void
}) {
  const [rounds, setRounds] = useState<Round[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // null = not editing; '' = adding a new round; otherwise the round id.
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)

  const url = (path = '') => `/api/admin/round${path}?token=${encodeURIComponent(token)}`

  const load = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/admin/round?token=${encodeURIComponent(token)}&category=${encodeURIComponent(role)}`
      )
      if (!res.ok) throw new Error('โหลดรอบไม่สำเร็จ')
      const list = (await res.json()) as Round[]
      setRounds(list)
      onActiveChange(list.find((r) => r.is_active) ?? null)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [token, role, onActiveChange])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount; load sets loading state
    load()
  }, [load])

  async function send(path: string, method: string, body?: unknown) {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(url(path), {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'บันทึกไม่สำเร็จ')
        return false
      }
      await load()
      return true
    } catch (err) {
      setError((err as Error).message)
      return false
    } finally {
      setBusy(false)
    }
  }

  async function save() {
    const fields = {
      label: draft.label,
      matching_opens_at: toIso(draft.opens),
      matching_closes_at: toIso(draft.closes),
    }
    const ok =
      editing === ''
        ? await send('', 'POST', { ...fields, category: role })
        : await send(`/${editing}`, 'PATCH', fields)
    if (ok) setEditing(null)
  }

  function startEdit(r: Round | null) {
    setEditing(r?.id ?? '')
    setDraft(
      r
        ? { label: r.label, opens: toDatetimeLocal(r.matching_opens_at), closes: toDatetimeLocal(r.matching_closes_at) }
        : EMPTY_DRAFT
    )
    setError(null)
  }

  const active = rounds.find((r) => r.is_active) ?? null
  const input = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <div className="max-w-5xl space-y-4">
      <div className="rounded-lg bg-white p-6 shadow">
        <p className="text-sm text-gray-500">รอบปัจจุบันของ {roleName}</p>
        {loading ? (
          <p className="mt-1 text-gray-600">กำลังโหลด...</p>
        ) : active ? (
          <>
            <h2 className="mt-1 text-lg font-bold">รอบ {active.label}</h2>
            <p className="mt-1 text-sm text-gray-600">
              สถานะ: <span className="font-medium">{PHASE_LABEL[roundPhase(active)]}</span> · เปิด{' '}
              {formatDate(active.matching_opens_at)} · ปิด {formatDate(active.matching_closes_at)}
            </p>
          </>
        ) : (
          <h2 className="mt-1 text-lg font-bold">ยังไม่มีรอบที่ใช้งาน — เพิ่มรอบแล้วกด &quot;ใช้รอบนี้&quot;</h2>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      )}

      <div className="rounded-lg bg-white shadow">
        <div className="flex items-center justify-between p-4">
          <h3 className="font-semibold">รอบทั้งหมด</h3>
          <button
            onClick={() => startEdit(null)}
            disabled={busy || editing !== null}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40"
          >
            + เพิ่มรอบ
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead className="border-y border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">รอบ</th>
                <th className="px-4 py-2">เปิดจับคู่</th>
                <th className="px-4 py-2">ปิดจับคู่</th>
                <th className="px-4 py-2">สถานะ</th>
                <th className="px-4 py-2 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {editing === '' && (
                <DraftRow draft={draft} setDraft={setDraft} busy={busy} onSave={save} onCancel={() => setEditing(null)} input={input} />
              )}
              {rounds.map((r) =>
                editing === r.id ? (
                  <DraftRow key={r.id} draft={draft} setDraft={setDraft} busy={busy} onSave={save} onCancel={() => setEditing(null)} input={input} />
                ) : (
                  <tr key={r.id} className={r.is_active ? 'bg-blue-50/40' : undefined}>
                    <td className="px-4 py-2 font-medium">{r.label}</td>
                    <td className="px-4 py-2">{formatDate(r.matching_opens_at)}</td>
                    <td className="px-4 py-2">{formatDate(r.matching_closes_at)}</td>
                    <td className="px-4 py-2">
                      {r.is_active ? (
                        <span className="inline-block rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                          ใช้งานอยู่ · {PHASE_LABEL[roundPhase(r)]}
                        </span>
                      ) : (
                        <span className="inline-block rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                          ไม่ได้ใช้งาน
                        </span>
                      )}
                    </td>
                    <td className="space-x-2 whitespace-nowrap px-4 py-2 text-right">
                      <button onClick={() => startEdit(r)} disabled={busy || editing !== null} className="text-blue-600 hover:underline disabled:opacity-40">
                        แก้ไข
                      </button>
                      {!r.is_active && (
                        <>
                          <button
                            onClick={() => send(`/${r.id}`, 'PATCH', { is_active: true })}
                            disabled={busy}
                            className="text-green-700 hover:underline disabled:opacity-40"
                          >
                            ใช้รอบนี้
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`ลบรอบ ${r.label}?`)) send(`/${r.id}`, 'DELETE')
                            }}
                            disabled={busy}
                            className="text-red-600 hover:underline disabled:opacity-40"
                          >
                            ลบ
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                )
              )}
              {!loading && rounds.length === 0 && editing !== '' && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                    ยังไม่มีรอบของ {roleName}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function DraftRow({
  draft,
  setDraft,
  busy,
  onSave,
  onCancel,
  input,
}: {
  draft: Draft
  setDraft: (d: Draft) => void
  busy: boolean
  onSave: () => void
  onCancel: () => void
  input: string
}) {
  return (
    <tr className="bg-yellow-50/50">
      <td className="px-4 py-2">
        <input className={input} placeholder="เช่น 1/2570" value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
      </td>
      <td className="px-4 py-2">
        <input type="datetime-local" className={input} value={draft.opens} onChange={(e) => setDraft({ ...draft, opens: e.target.value })} />
      </td>
      <td className="px-4 py-2">
        <input type="datetime-local" className={input} value={draft.closes} onChange={(e) => setDraft({ ...draft, closes: e.target.value })} />
      </td>
      <td className="px-4 py-2 text-xs text-gray-500">เว้นว่าง = ยังไม่กำหนด</td>
      <td className="space-x-2 whitespace-nowrap px-4 py-2 text-right">
        <button onClick={onSave} disabled={busy} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-40">
          บันทึก
        </button>
        <button onClick={onCancel} disabled={busy} className="text-gray-600 hover:underline">
          ยกเลิก
        </button>
      </td>
    </tr>
  )
}
