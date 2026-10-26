'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface AdminUser {
  id: string
  username: string
  created_at: string
}

// Same default as lib/admin-password.ts, which is server-only (node:crypto).
const MIN_PASSWORD_LENGTH = 10

export default function AdminUsersPage() {
  const [token, setToken] = useState<string | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordFor, setPasswordFor] = useState<string | null>(null)
  const [changedPassword, setChangedPassword] = useState('')

  const me = (() => {
    try {
      const payload = token?.split('.')[0]
      return payload ? (JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))).u as string) : null
    } catch {
      return null
    }
  })()

  async function call(path: string, init?: RequestInit) {
    const res = await fetch(`${path}?token=${encodeURIComponent(token ?? '')}`, {
      ...init,
      headers: { 'Content-Type': 'application/json' },
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`)
    return body
  }

  async function load(authToken: string) {
    try {
      const res = await fetch(`/api/admin/users?token=${encodeURIComponent(authToken)}`)
      if (res.status === 401) {
        setError('Session expired — log in again from the dashboard.')
        return
      }
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Failed to load')
      setUsers(await res.json())
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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setNotice(null)
    try {
      await call('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({ username: newUsername, password: newPassword }),
      })
      setNewUsername('')
      setNewPassword('')
      setNotice('Admin user created')
      if (token) await load(token)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function handleChangePassword(id: string) {
    setError(null)
    setNotice(null)
    try {
      await call(`/api/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ password: changedPassword }),
      })
      setPasswordFor(null)
      setChangedPassword('')
      setNotice('Password changed')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function handleDelete(user: AdminUser) {
    if (!window.confirm(`Delete admin "${user.username}"? They stay logged in until their session expires.`)) return
    setError(null)
    setNotice(null)
    try {
      await call(`/api/admin/users/${user.id}`, { method: 'DELETE' })
      setNotice('Admin user deleted')
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

  const inputClass =
    'rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-3xl font-bold">Admin Users</h1>

        {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {notice && <p className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{notice}</p>}

        <form onSubmit={handleCreate} className="mb-6 rounded-lg bg-white p-4 shadow">
          <h2 className="mb-3 font-semibold">Add admin</h2>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="username (a-z 0-9 . _ -)"
              autoComplete="off"
              className={`${inputClass} flex-1`}
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={`password (min ${MIN_PASSWORD_LENGTH})`}
              autoComplete="new-password"
              className={`${inputClass} flex-1`}
            />
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Add</button>
          </div>
        </form>

        <ul className="divide-y divide-gray-200 rounded-lg bg-white shadow">
          {users.map((u) => (
            <li key={u.id} className="p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-medium">
                    {u.username}
                    {u.username === me && <span className="ml-2 text-xs text-gray-500">(you)</span>}
                  </p>
                  <p className="text-xs text-gray-500">Created {new Date(u.created_at).toLocaleDateString('th-TH')}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setPasswordFor(passwordFor === u.id ? null : u.id)
                      setChangedPassword('')
                    }}
                    className="rounded-lg border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100"
                  >
                    Change password
                  </button>
                  {u.username !== me && (
                    <button
                      onClick={() => handleDelete(u)}
                      className="rounded-lg border border-red-300 px-3 py-1 text-sm text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              {passwordFor === u.id && (
                <div className="mt-3 flex gap-2">
                  <input
                    type="password"
                    value={changedPassword}
                    onChange={(e) => setChangedPassword(e.target.value)}
                    placeholder={`new password (min ${MIN_PASSWORD_LENGTH})`}
                    autoComplete="new-password"
                    className={`${inputClass} flex-1`}
                  />
                  <button
                    onClick={() => handleChangePassword(u.id)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
