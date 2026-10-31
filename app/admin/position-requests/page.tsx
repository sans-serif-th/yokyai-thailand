'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface PositionRequestRow {
  id: string
  line_user_id: string
  position_name: string
  transfer_round: string | null
  criteria: string
  contact_consent: boolean
  handled_at: string | null
  created_at: string
}

export default function AdminPositionRequestsPage() {
  const [token, setToken] = useState<string | null>(null)
  const [rows, setRows] = useState<PositionRequestRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showHandled, setShowHandled] = useState(false)

  async function call(path: string, init?: RequestInit, authToken = token) {
    const res = await fetch(`${path}?token=${encodeURIComponent(authToken ?? '')}`, {
      ...init,
      headers: { 'Content-Type': 'application/json' },
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(
        res.status === 401 ? 'Session expired — log in again from the dashboard.' : body.error || `Request failed (${res.status})`
      )
    }
    return body
  }

  async function load(authToken: string) {
    try {
      setRows(await call('/api/admin/position-requests', undefined, authToken))
    } catch (err) {
      setError((err as Error).message)
    }
  }

  useEffect(() => {
    const stored = localStorage.getItem('admin_token')
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setToken(stored)
      load(stored)
    }
  }, [])

  async function setHandled(row: PositionRequestRow, handled: boolean) {
    setError(null)
    try {
      await call(`/api/admin/position-requests/${row.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ handled }),
      })
      if (token) await load(token)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
          <p className="mb-4">Please log in from the main admin dashboard first.</p>
          <Link href="/admin" className="font-medium text-blue-600 hover:underline">
            Go to Admin Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const open = rows.filter((r) => !r.handled_at)
  const visible = showHandled ? rows : open

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-3xl font-bold">Position requests</h1>
        <p className="mb-4 text-sm text-gray-600">
          Positions users could not find in the registration dropdown. {open.length} open, {rows.length - open.length}{' '}
          handled (latest 200 shown).
        </p>

        <label className="mb-4 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showHandled} onChange={(e) => setShowHandled(e.target.checked)} />
          Show handled requests
        </label>

        {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        {visible.length === 0 && (
          <p className="rounded-lg bg-white p-6 text-center text-gray-500 shadow">No requests.</p>
        )}

        <ul className="flex flex-col gap-3">
          {visible.map((r) => (
            <li key={r.id} className={`rounded-lg bg-white p-4 shadow ${r.handled_at ? 'opacity-60' : ''}`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-lg font-semibold">{r.position_name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(r.created_at).toLocaleString('th-TH')}
                    {r.transfer_round && ` · ${r.transfer_round}`}
                  </p>
                </div>
                <button
                  onClick={() => setHandled(r, !r.handled_at)}
                  className="rounded-lg border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50"
                >
                  {r.handled_at ? 'Reopen' : 'Mark handled'}
                </button>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm">{r.criteria}</p>
              <p className="mt-2 text-xs text-gray-500">
                {r.contact_consent ? 'OK to contact' : 'Did not agree to be contacted'} · LINE user{' '}
                <span className="font-mono">{r.line_user_id}</span>
                {r.handled_at && ` · handled ${new Date(r.handled_at).toLocaleDateString('th-TH')}`}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
