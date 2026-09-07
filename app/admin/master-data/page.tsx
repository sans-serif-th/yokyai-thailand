'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TEACHING_GROUPS, teachingGroupLabel } from '@/lib/teaching-groups'

interface Subject {
  id: string
  teaching_group: string
  name_th: string
}

interface ServiceType {
  code: string
  name_th: string
  abbr_th: string
}

type MasterTab = 'subjects' | 'service_types'

export default function MasterDataPage() {
  const [authed, setAuthed] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [tab, setTab] = useState<MasterTab>('subjects')

  const [subjects, setSubjects] = useState<Subject[]>([])
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [error, setError] = useState<string | null>(null)

  const [newSubjectGroup, setNewSubjectGroup] = useState<string>(TEACHING_GROUPS[0].code)
  const [newSubjectName, setNewSubjectName] = useState('')

  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [editingServiceType, setEditingServiceType] = useState<ServiceType | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem('admin_token')
    if (storedToken) {
      setToken(storedToken)
      setAuthed(true)
      loadData(storedToken)
    }
  }, [])

  async function loadData(authToken: string) {
    setError(null)
    try {
      const [subjectsRes, serviceTypesRes] = await Promise.all([
        fetch(`/api/admin/master-data/subjects?token=${encodeURIComponent(authToken)}`),
        fetch(`/api/admin/master-data/service-types?token=${encodeURIComponent(authToken)}`),
      ])
      if (subjectsRes.ok) setSubjects(await subjectsRes.json())
      if (serviceTypesRes.ok) setServiceTypes(await serviceTypesRes.json())
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function handleAddSubject(e: React.FormEvent) {
    e.preventDefault()
    if (!token || !newSubjectName.trim()) return
    setError(null)
    try {
      const res = await fetch(`/api/admin/master-data/subjects?token=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teaching_group: newSubjectGroup, name_th: newSubjectName.trim() }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error || 'Failed to add subject')
        return
      }
      const created = await res.json()
      setSubjects((prev) =>
        [...prev, created].sort(
          (a, b) =>
            a.teaching_group.localeCompare(b.teaching_group) || a.name_th.localeCompare(b.name_th)
        )
      )
      setNewSubjectName('')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function handleSaveSubject(updated: Subject) {
    if (!token) return
    setError(null)
    try {
      const res = await fetch(
        `/api/admin/master-data/subjects/${updated.id}?token=${encodeURIComponent(token)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teaching_group: updated.teaching_group, name_th: updated.name_th }),
        }
      )
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error || 'Failed to save subject')
        return
      }
      const saved = await res.json()
      setSubjects((prev) => prev.map((s) => (s.id === saved.id ? saved : s)))
      setEditingSubject(null)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function handleDeleteSubject(id: string) {
    if (!token) return
    if (!window.confirm('Delete this subject? Teachers already using this text are unaffected.'))
      return
    setError(null)
    try {
      const res = await fetch(`/api/admin/master-data/subjects/${id}?token=${encodeURIComponent(token)}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error || 'Failed to delete subject')
        return
      }
      setSubjects((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function handleSaveServiceType(updated: ServiceType) {
    if (!token) return
    setError(null)
    try {
      const res = await fetch(
        `/api/admin/master-data/service-types?token=${encodeURIComponent(token)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        }
      )
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error || 'Failed to save service type')
        return
      }
      const saved = await res.json()
      setServiceTypes((prev) => prev.map((s) => (s.code === saved.code ? saved : s)))
      setEditingServiceType(null)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <p className="mb-4">Please log in from the main admin dashboard first.</p>
          <Link href="/admin" className="text-blue-600 hover:underline font-medium">
            Go to Admin Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Master Data</h1>
            <Link href="/admin" className="text-sm text-blue-600 hover:underline">
              ← Back to Admin Dashboard
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-2 mb-6 border-b border-gray-300">
          <button
            onClick={() => setTab('subjects')}
            className={`px-4 py-2 font-medium border-b-2 ${
              tab === 'subjects'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Subjects ({subjects.length})
          </button>
          <button
            onClick={() => setTab('service_types')}
            className={`px-4 py-2 font-medium border-b-2 ${
              tab === 'service_types'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            สพฐ (Service Types)
          </button>
        </div>

        {tab === 'subjects' && (
          <div className="space-y-4">
            <form
              onSubmit={handleAddSubject}
              className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row gap-3"
            >
              <select
                value={newSubjectGroup}
                onChange={(e) => setNewSubjectGroup(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TEACHING_GROUPS.map((g) => (
                  <option key={g.code} value={g.code}>
                    {g.nameTh}
                  </option>
                ))}
              </select>
              <input
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                placeholder="ชื่อวิชาเอก เช่น เอกคณิตศาสตร์"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
              >
                Add Subject
              </button>
            </form>

            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b border-gray-300">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Teaching Group</th>
                    <th className="px-4 py-3 text-left font-medium">Subject (วิชาเอก)</th>
                    <th className="px-4 py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {subjects.map((s) =>
                    editingSubject?.id === s.id ? (
                      <tr key={s.id} className="bg-blue-50">
                        <td className="px-4 py-2">
                          <select
                            value={editingSubject.teaching_group}
                            onChange={(e) =>
                              setEditingSubject({ ...editingSubject, teaching_group: e.target.value })
                            }
                            className="px-2 py-1 border border-gray-300 rounded"
                          >
                            {TEACHING_GROUPS.map((g) => (
                              <option key={g.code} value={g.code}>
                                {g.nameTh}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          <input
                            value={editingSubject.name_th}
                            onChange={(e) =>
                              setEditingSubject({ ...editingSubject, name_th: e.target.value })
                            }
                            className="px-2 py-1 border border-gray-300 rounded w-full"
                          />
                        </td>
                        <td className="px-4 py-2 space-x-2">
                          <button
                            onClick={() => handleSaveSubject(editingSubject)}
                            className="text-green-600 hover:underline text-xs font-medium"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingSubject(null)}
                            className="text-gray-600 hover:underline text-xs font-medium"
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ) : (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{teachingGroupLabel(s.teaching_group)}</td>
                        <td className="px-4 py-3">{s.name_th}</td>
                        <td className="px-4 py-3 space-x-2">
                          <button
                            onClick={() => setEditingSubject(s)}
                            className="text-blue-600 hover:underline text-xs font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteSubject(s.id)}
                            className="text-red-600 hover:underline text-xs font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                  {subjects.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                        No subjects yet — add one above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'service_types' && (
          <div className="space-y-4">
            <p className="text-xs text-gray-500">
              These codes (primary/secondary/vocational) are fixed in the app&apos;s matching logic
              — you can edit the Thai display labels here, but not add or remove entries.
            </p>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b border-gray-300">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Code</th>
                    <th className="px-4 py-3 text-left font-medium">ชื่อเต็ม (name_th)</th>
                    <th className="px-4 py-3 text-left font-medium">ตัวย่อ (abbr_th)</th>
                    <th className="px-4 py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {serviceTypes.map((s) =>
                    editingServiceType?.code === s.code ? (
                      <tr key={s.code} className="bg-blue-50">
                        <td className="px-4 py-2 font-mono text-xs">{s.code}</td>
                        <td className="px-4 py-2">
                          <input
                            value={editingServiceType.name_th}
                            onChange={(e) =>
                              setEditingServiceType({
                                ...editingServiceType,
                                name_th: e.target.value,
                              })
                            }
                            className="px-2 py-1 border border-gray-300 rounded w-full"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            value={editingServiceType.abbr_th}
                            onChange={(e) =>
                              setEditingServiceType({
                                ...editingServiceType,
                                abbr_th: e.target.value,
                              })
                            }
                            className="px-2 py-1 border border-gray-300 rounded w-full"
                          />
                        </td>
                        <td className="px-4 py-2 space-x-2">
                          <button
                            onClick={() => handleSaveServiceType(editingServiceType)}
                            className="text-green-600 hover:underline text-xs font-medium"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingServiceType(null)}
                            className="text-gray-600 hover:underline text-xs font-medium"
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ) : (
                      <tr key={s.code} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-xs">{s.code}</td>
                        <td className="px-4 py-3">{s.name_th}</td>
                        <td className="px-4 py-3">{s.abbr_th}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setEditingServiceType(s)}
                            className="text-blue-600 hover:underline text-xs font-medium"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
