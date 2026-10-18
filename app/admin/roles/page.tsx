'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { RolesTable, type AdminRole } from './roles-table'

export default function AdminRolesPage() {
  const [token, setToken] = useState<string | null>(null)
  const [roles, setRoles] = useState<AdminRole[]>([])
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [nameTh, setNameTh] = useState('')
  const [nameEn, setNameEn] = useState('')

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
      setRoles(await call('/api/admin/roles', undefined, authToken))
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

  async function run(action: () => Promise<unknown>, success: string) {
    setError(null)
    setNotice(null)
    try {
      await action()
      setNotice(success)
      if (token) await load(token)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    run(async () => {
      await call('/api/admin/roles', {
        method: 'POST',
        body: JSON.stringify({ code: code.trim(), name_th: nameTh, name_en: nameEn }),
      })
      setCode('')
      setNameTh('')
      setNameEn('')
    }, 'Role added (as "coming soon")')
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

  const inputClass =
    'rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-3xl font-bold">Roles</h1>
        <p className="mb-6 text-sm text-gray-600">
          Types of users (ครู, พยาบาล, …). A role can only be set to Active once code for its
          registration and matching exists — see docs/adding-a-role.md.
        </p>

        {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {notice && <p className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{notice}</p>}

        <RolesTable
          roles={roles}
          onSave={(roleCode, changes) =>
            run(
              () =>
                call(`/api/admin/roles/${roleCode}`, { method: 'PATCH', body: JSON.stringify(changes) }),
              'Saved'
            )
          }
          onDelete={(role) => {
            if (!window.confirm(`Delete role "${role.name_th}"?`)) return
            run(() => call(`/api/admin/roles/${role.code}`, { method: 'DELETE' }), 'Role deleted')
          }}
        />

        <form onSubmit={handleCreate} className="mt-6 rounded-lg bg-white p-4 shadow">
          <h2 className="mb-3 font-semibold">Add role</h2>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="code (e.g. nurse)"
              autoComplete="off"
              className={`${inputClass} flex-1`}
            />
            <input
              value={nameTh}
              onChange={(e) => setNameTh(e.target.value)}
              placeholder="Thai name"
              className={`${inputClass} flex-1`}
            />
            <input
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="English name"
              className={`${inputClass} flex-1`}
            />
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Add</button>
          </div>
        </form>
      </div>
    </div>
  )
}
