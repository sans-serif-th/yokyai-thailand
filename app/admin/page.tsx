'use client'

import { Suspense, useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import type { AdminStatus, Round, Teacher, Destination } from '@/lib/types'
import { RoundPanel } from './round-panel'
import { getRoleFields } from '@/lib/roles/field-registry'
import { adminEditableFields, type FieldType } from '@/lib/roles/fields'
import { roundPhase, type RoundPhase } from '@/lib/round-phase'
import { serviceTypeAbbr, SERVICE_TYPES } from '@/lib/service-types'

const PHASE_BADGE: Record<RoundPhase, string> = {
  registration: '🟡 Registration',
  matching: '🟢 Matching',
  closed: '🔴 Closed',
}

type TabType = 'teachers' | 'matches' | 'coverage' | 'round'

type AdminTeacher = Teacher & {
  destinations: Destination[]
  created_at: string
  updated_at: string
}

// Internal outreach-tracking dropdown shown on the Match Coverage page.
const ADMIN_STATUS_OPTIONS: { value: AdminStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'closed', label: 'Closed' },
]

interface PotentialMatch {
  seed: AdminTeacher
  realUser: AdminTeacher
}

interface MatchCoverage {
  totalTeachers: number
  teachersWithDestinations: number
  matchCount: number
  pairs: {
    a: AdminTeacher
    b: AdminTeacher
  }[]
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const date = d.toLocaleDateString('en-CA') // YYYY-MM-DD, locale-independent
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) // HH:mm
  return `${date} ${time}`
}

function destinationLabel(d: Destination) {
  return d.zone ? `${d.province} (${d.zone})` : d.province
}

function invitationUrl(inviteCode: string) {
  return `${window.location.origin}/join/${inviteCode}`
}

// ISO timestamp -> the local "YYYY-MM-DDTHH:mm" string <input
// type="datetime-local"> expects, in the browser's own timezone.
// The dashboard shows one role's data at a time, chosen from the side menu
// (/admin?role=<code>, see app/admin/layout.tsx). Teacher is the default.
const DEFAULT_ROLE = 'teacher'

export default function AdminDashboard() {
  return (
    <Suspense>
      <AdminDashboardContent />
    </Suspense>
  )
}

function AdminDashboardContent() {
  const role = useSearchParams().get('role') ?? DEFAULT_ROLE
  const [authed, setAuthed] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [teachers, setTeachers] = useState<AdminTeacher[]>([])
  const [matches, setMatches] = useState<PotentialMatch[]>([])
  const [coverage, setCoverage] = useState<MatchCoverage | null>(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<TabType>('teachers')
  const [editingTeacher, setEditingTeacher] = useState<AdminTeacher | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  // Filters
  const [sourceFilter, setSourceFilter] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [originFilter, setOriginFilter] = useState('')
  const [destinationFilter, setDestinationFilter] = useState('')
  const [serviceTypeFilter, setServiceTypeFilter] = useState('')
  const [roundFilter, setRoundFilter] = useState('')
  const [roles, setRoles] = useState<{ code: string; name_th: string; hasImplementation: boolean }[]>([])

  const [activeRound, setActiveRound] = useState<Round | null>(null)

  const [page, setPage] = useState(1)
  const pageSize = 25

  function roundKey(t: AdminTeacher) {
    if (!t.transfer_round && !t.transfer_year) return ''
    return `${t.transfer_round ?? '–'}/${t.transfer_year ?? '–'}`
  }

  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      if (sourceFilter && t.source !== sourceFilter) return false
      if (subjectFilter && t.subject !== subjectFilter) return false
      if (originFilter && t.origin_province !== originFilter) return false
      if (destinationFilter && !t.destinations?.some((d) => d.province === destinationFilter)) return false
      if (serviceTypeFilter && t.service_type !== serviceTypeFilter) return false
      if (roundFilter && roundKey(t) !== roundFilter) return false
      return true
    })
  }, [
    teachers,
    sourceFilter,
    subjectFilter,
    originFilter,
    destinationFilter,
    serviceTypeFilter,
    roundFilter,
  ])

  // Reset to page 1 whenever the filtered set changes underneath the current page.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset page when filters change
    setPage(1)
  }, [sourceFilter, subjectFilter, originFilter, destinationFilter, serviceTypeFilter, roundFilter])

  const totalPages = Math.max(1, Math.ceil(filteredTeachers.length / pageSize))
  const paginatedTeachers = useMemo(
    () => filteredTeachers.slice((page - 1) * pageSize, page * pageSize),
    [filteredTeachers, page]
  )

  const sourceCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const t of teachers) counts[t.source] = (counts[t.source] ?? 0) + 1
    return counts
  }, [teachers])

  const subjectCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const t of teachers) if (t.subject) counts[t.subject] = (counts[t.subject] ?? 0) + 1
    return counts
  }, [teachers])

  const originCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const t of teachers) if (t.origin_province) counts[t.origin_province] = (counts[t.origin_province] ?? 0) + 1
    return counts
  }, [teachers])

  const destinationCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const t of teachers) {
      for (const d of t.destinations ?? []) {
        if (d.province) counts[d.province] = (counts[d.province] ?? 0) + 1
      }
    }
    return counts
  }, [teachers])

  const serviceTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const t of teachers) counts[t.service_type] = (counts[t.service_type] ?? 0) + 1
    return counts
  }, [teachers])

  const roundCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const t of teachers) {
      const key = roundKey(t)
      if (key) counts[key] = (counts[key] ?? 0) + 1
    }
    return counts
  }, [teachers])

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('admin_token')
    if (storedToken) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-off mount read of localStorage
      setToken(storedToken)
      setAuthed(true)
      // Role changes (side menu) reload the data for that role.
      // eslint-disable-next-line react-hooks/immutability -- loadData is a hoisted function declared below
      loadData(storedToken, role)
    }
  }, [role])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        setPasswordError('Invalid username or password')
        return
      }

      const { token: newToken } = await response.json()
      localStorage.setItem('admin_token', newToken)
      window.dispatchEvent(new Event('admin-auth-change'))
      setToken(newToken)
      setAuthed(true)
      setPassword('')
      setUsername('')
      loadData(newToken, role)
    } catch {
      setPasswordError('Login failed')
    }
  }

  const loadData = async (authToken: string, roleCode: string) => {
    setLoading(true)
    const scope = `token=${encodeURIComponent(authToken)}&category=${encodeURIComponent(roleCode)}`
    try {
      // Role names for the category column/filter — best-effort, the page
      // works without them (falls back to the raw code).
      fetch(`/api/admin/roles?token=${encodeURIComponent(authToken)}`)
        .then((res) => (res.ok ? res.json() : []))
        .then(setRoles)
        .catch(() => {})

      const [teachersRes, matchesRes, coverageRes] = await Promise.all([
        fetch(`/api/admin/teachers?${scope}`),
        fetch(`/api/admin/potential-matches?${scope}`),
        fetch(`/api/admin/all-matches?${scope}`),
      ])

      // Best-effort: only feeds the Round tab badge (the tab itself loads the list).
      fetch(`/api/admin/round?${scope}`)
        .then((res) => (res.ok ? res.json() : []))
        .then((list: Round[]) => setActiveRound(list.find((r) => r.is_active) ?? null))
        .catch(() => {})

      // Expired (or pre-upgrade) token: drop it and go back to the login form.
      if (teachersRes.status === 401) {
        localStorage.removeItem('admin_token')
        window.dispatchEvent(new Event('admin-auth-change'))
        setToken(null)
        setAuthed(false)
        return
      }
      if (!teachersRes.ok) {
        console.error('Teachers API error:', teachersRes.status)
        return
      }
      if (!matchesRes.ok) {
        console.error('Matches API error:', matchesRes.status)
        return
      }
      if (!coverageRes.ok) {
        console.error('Coverage API error:', coverageRes.status)
        return
      }

      const teachers = await teachersRes.json()
      const matches = await matchesRes.json()
      const coverage = await coverageRes.json()
      setTeachers(teachers)
      setMatches(matches)
      setCoverage(coverage)

    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (teacherId: string) => {
    if (!token) return
    if (!window.confirm('Delete this teacher permanently? This cannot be undone.')) return

    setActionError(null)
    try {
      const res = await fetch(
        `/api/admin/teachers/${teacherId}?token=${encodeURIComponent(token)}`,
        { method: 'DELETE' }
      )
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setActionError(body.error || 'Failed to delete teacher')
        return
      }
      setTeachers((prev) => prev.filter((t) => t.id !== teacherId))
    } catch (err) {
      setActionError((err as Error).message)
    }
  }

  const handleSaveEdit = async (updated: Partial<AdminTeacher>) => {
    if (!token || !editingTeacher) return

    setActionError(null)
    try {
      const res = await fetch(
        `/api/admin/teachers/${editingTeacher.id}?token=${encodeURIComponent(token)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        }
      )
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setActionError(body.error || 'Failed to save changes')
        return
      }
      const saved = await res.json()
      setTeachers((prev) => prev.map((t) => (t.id === saved.id ? saved : t)))
      setEditingTeacher(null)
    } catch (err) {
      setActionError((err as Error).message)
    }
  }

  // Internal outreach-tracking dropdown on Match Coverage — updates the
  // teachers list plus the already-fetched coverage/matches snapshots (both
  // hold their own copies of each teacher row) so the change shows up
  // immediately no matter which tab is open.
  const handleStatusChange = async (teacherId: string, status: AdminStatus) => {
    if (!token) return

    setActionError(null)
    try {
      const res = await fetch(
        `/api/admin/teachers/${teacherId}?token=${encodeURIComponent(token)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ admin_status: status }),
        }
      )
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setActionError(body.error || 'Failed to update status')
        return
      }
      const saved = await res.json()
      setTeachers((prev) => prev.map((t) => (t.id === saved.id ? saved : t)))
      setCoverage((prev) =>
        prev
          ? {
              ...prev,
              pairs: prev.pairs.map((p) => ({
                a: p.a.id === saved.id ? saved : p.a,
                b: p.b.id === saved.id ? saved : p.b,
              })),
            }
          : prev
      )
      setMatches((prev) =>
        prev.map((m) => ({
          seed: m.seed.id === saved.id ? saved : m.seed,
          realUser: m.realUser.id === saved.id ? saved : m.realUser,
        }))
      )
    } catch (err) {
      setActionError((err as Error).message)
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter username"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password"
              />
            </div>
            {passwordError && <p className="text-red-600 text-sm">{passwordError}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            Admin Dashboard
            <span className="ml-3 text-xl font-medium text-gray-500">
              {roles.find((r) => r.code === role)?.name_th ?? role}
            </span>
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-300">
          <button
            onClick={() => setTab('teachers')}
            className={`px-4 py-2 font-medium border-b-2 ${
              tab === 'teachers'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            All Teachers ({teachers.length})
          </button>
          <button
            onClick={() => setTab('matches')}
            className={`px-4 py-2 font-medium border-b-2 ${
              tab === 'matches'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Invite-Ready Matches ({matches.length})
          </button>
          <button
            onClick={() => setTab('coverage')}
            className={`px-4 py-2 font-medium border-b-2 ${
              tab === 'coverage'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Match Coverage ({coverage?.matchCount ?? 0})
          </button>
          <button
            onClick={() => setTab('round')}
            className={`px-4 py-2 font-medium border-b-2 ${
              tab === 'round'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Round {PHASE_BADGE[roundPhase(activeRound)]}
          </button>
        </div>

        {actionError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 mb-4 text-sm">
            {actionError}
          </div>
        )}

        {loading && teachers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">
            Loading…
          </div>
        ) : (
          <>
        {tab === 'teachers' && (
          <div>
            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select
                  value={serviceTypeFilter}
                  onChange={(e) => setServiceTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All สพฐ</option>
                  {SERVICE_TYPES.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.abbrTh} ({serviceTypeCounts[s.code] ?? 0})
                    </option>
                  ))}
                </select>
                <select
                  value={roundFilter}
                  onChange={(e) => setRoundFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Rounds</option>
                  {Object.keys(roundCounts)
                    .sort()
                    .map((r) => (
                      <option key={r} value={r}>
                        {r} ({roundCounts[r]})
                      </option>
                    ))}
                </select>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Sources</option>
                  <option value="app">App User ({sourceCounts.app ?? 0})</option>
                  <option value="facebook_import">
                    Facebook Import ({sourceCounts.facebook_import ?? 0})
                  </option>
                </select>
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Subjects</option>
                  {[...new Set(teachers.map((t) => t.subject).filter(Boolean) as string[])].map((s) => (
                    <option key={s} value={s}>
                      {s} ({subjectCounts[s] ?? 0})
                    </option>
                  ))}
                </select>
                <select
                  value={originFilter}
                  onChange={(e) => setOriginFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Origins</option>
                  {[...new Set(teachers.map((t) => t.origin_province).filter(Boolean))].map((p) => (
                    <option key={p} value={p}>
                      {p} ({originCounts[p] ?? 0})
                    </option>
                  ))}
                </select>
                <select
                  value={destinationFilter}
                  onChange={(e) => setDestinationFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Destinations</option>
                  {[
                    ...new Set(
                      teachers
                        .flatMap((t) => t.destinations?.map((d) => d.province) || [])
                        .filter(Boolean)
                    ),
                  ].map((p) => (
                    <option key={p} value={p}>
                      {p} ({destinationCounts[p] ?? 0})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Teachers List */}
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b border-gray-300">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Name</th>
                    <th className="px-4 py-3 text-left font-medium">Category</th>
                    <th className="px-4 py-3 text-left font-medium">สพฐ</th>
                    <th className="px-4 py-3 text-left font-medium">Source</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Subject</th>
                    <th className="px-4 py-3 text-left font-medium">Origin</th>
                    <th className="px-4 py-3 text-left font-medium">เขต</th>
                    <th className="px-4 py-3 text-left font-medium">School</th>
                    <th className="px-4 py-3 text-left font-medium">Destinations</th>
                    <th className="px-4 py-3 text-left font-medium">Facebook</th>
                    <th className="px-4 py-3 text-left font-medium">Invitation Link</th>
                    <th className="px-4 py-3 text-left font-medium">Created</th>
                    <th className="px-4 py-3 text-left font-medium">Modified</th>
                    <th className="px-4 py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedTeachers.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{t.display_name}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {roles.find((r) => r.code === t.category)?.name_th ?? t.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">{serviceTypeAbbr(t.service_type)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            t.source === 'app'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {t.source === 'app' ? 'App' : 'Imported'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {t.claimed_at ? (
                          <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ Verified
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Unclaimed
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">{t.subject || '–'}</td>
                      <td className="px-4 py-3">{t.origin_province}</td>
                      <td className="px-4 py-3">{t.origin_zone || '–'}</td>
                      <td className="px-4 py-3">{t.current_school || '–'}</td>
                      <td className="px-4 py-3 text-xs">
                        {t.destinations?.map(destinationLabel).join(', ') || '–'}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {t.facebook_url ? (
                          <a
                            href={t.facebook_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline font-medium"
                          >
                            Profile
                          </a>
                        ) : (
                          '–'
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {!t.claimed_at && t.invite_code ? (
                          <button
                            onClick={() =>
                              navigator.clipboard.writeText(
                                `${window.location.origin}/join/${t.invite_code}`
                              )
                            }
                            className="text-blue-600 hover:underline font-medium"
                            title={`${window.location.origin}/join/${t.invite_code}`}
                          >
                            Copy Link
                          </button>
                        ) : (
                          '–'
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap">{formatDate(t.created_at)}</td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap">{formatDate(t.updated_at)}</td>
                      <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => setEditingTeacher(t)}
                          className="text-blue-600 hover:underline text-xs font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="text-red-600 hover:underline text-xs font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-4 text-sm">
              <p className="text-gray-600">
                Showing {filteredTeachers.length === 0 ? 0 : (page - 1) * pageSize + 1}–
                {Math.min(page * pageSize, filteredTeachers.length)} of {filteredTeachers.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Previous
                </button>
                <span className="text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === 'matches' && (
          <div>
            {matches.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">
                No potential matches found.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg bg-white shadow">
                <table className="w-full min-w-[64rem] text-left text-sm">
                  <thead className="text-gray-700">
                    <tr>
                      <th colSpan={3} className="border-l-4 border-amber-500 bg-amber-50 px-3 py-2 font-medium">
                        Unclaimed (Facebook Import)
                      </th>
                      <th colSpan={3} className="border-l-4 border-green-500 bg-green-50 px-3 py-2 font-medium">
                        ✓ Verified (App)
                      </th>
                      <th rowSpan={2} className="bg-gray-100 px-3 py-2" />
                    </tr>
                    <tr className="bg-gray-100">
                      <th className="px-3 py-2 font-medium">Name</th>
                      <th className="px-3 py-2 font-medium">Subject</th>
                      <th className="px-3 py-2 font-medium">From → To</th>
                      <th className="border-l border-gray-200 px-3 py-2 font-medium">Name</th>
                      <th className="px-3 py-2 font-medium">Subject</th>
                      <th className="px-3 py-2 font-medium">From → To</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {matches.map((m, idx) => (
                      <tr key={idx} className="align-top hover:bg-gray-50">
                        <td className="px-3 py-3 font-medium">{m.seed.display_name}</td>
                        <td className="px-3 py-3">{m.seed.subject || '–'}</td>
                        <td className="px-3 py-3">
                          {m.seed.origin_province} → {m.seed.destinations?.map((d) => d.province).join(', ')}
                        </td>
                        <td className="border-l border-gray-200 px-3 py-3 font-medium">{m.realUser.display_name}</td>
                        <td className="px-3 py-3">{m.realUser.subject || '–'}</td>
                        <td className="px-3 py-3">
                          {m.realUser.origin_province} →{' '}
                          {m.realUser.destinations?.map((d) => d.province).join(', ')}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-right">
                          <button className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
                            Send Invite to Seed Owner
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === 'coverage' && (
          <div>
            <div className="bg-white rounded-lg shadow p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{coverage?.totalTeachers ?? 0}</p>
                <p className="text-sm text-gray-600">Total Teachers</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{coverage?.teachersWithDestinations ?? 0}</p>
                <p className="text-sm text-gray-600">With Destinations Set</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{coverage?.matchCount ?? 0}</p>
                <p className="text-sm text-gray-600">Mutual Match Pairs (all data)</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              This counts every reciprocal pair in the full dataset — position, service type,
              teaching group, and mutual destinations — regardless of claimed/verified status.
              It answers &quot;do we have enough users for matching to work&quot;, unlike
              &quot;Invite-Ready Matches&quot;, which only shows pairs where one side is
              already a verified app user.
            </p>
            {!coverage || coverage.pairs.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">
                No mutual pairs found in the current data.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg bg-white shadow">
                <table className="w-full min-w-[64rem] text-left text-sm">
                  <thead className="text-gray-700">
                    <tr>
                      <th colSpan={3} className="border-l-4 border-indigo-500 bg-indigo-50 px-3 py-2 font-medium">
                        Teacher A
                      </th>
                      <th colSpan={3} className="border-l-4 border-indigo-500 bg-indigo-50 px-3 py-2 font-medium">
                        Teacher B
                      </th>
                    </tr>
                    <tr className="bg-gray-100">
                      <th className="px-3 py-2 font-medium">Name</th>
                      <th className="px-3 py-2 font-medium">From → To</th>
                      <th className="px-3 py-2 font-medium">Outreach / links</th>
                      <th className="border-l border-gray-200 px-3 py-2 font-medium">Name</th>
                      <th className="px-3 py-2 font-medium">From → To</th>
                      <th className="px-3 py-2 font-medium">Outreach / links</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {coverage.pairs.map((p, idx) => (
                      <tr key={idx} className="align-top hover:bg-gray-50">
                        <CoverageCells teacher={p.a} onStatusChange={handleStatusChange} />
                        <CoverageCells teacher={p.b} onStatusChange={handleStatusChange} divider />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === 'round' && token && (
          <RoundPanel
            key={role}
            token={token}
            role={role}
            roleName={roles.find((r) => r.code === role)?.name_th ?? role}
            onActiveChange={setActiveRound}
          />
        )}
          </>
        )}
      </div>

      {editingTeacher && (
        <EditTeacherModal
          roles={roles}
          teacher={editingTeacher}
          onCancel={() => setEditingTeacher(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  )
}

// One teacher's three cells in a Match Coverage row: name (+ verified state and
// subject), route, and the internal outreach status with profile/invite links.
function CoverageCells({
  teacher: t,
  onStatusChange,
  divider,
}: {
  teacher: AdminTeacher
  onStatusChange: (teacherId: string, status: AdminStatus) => void
  divider?: boolean
}) {
  return (
    <>
      <td className={`px-3 py-3 ${divider ? 'border-l border-gray-200' : ''}`}>
        <p className="font-medium">{t.display_name}</p>
        <p className="text-xs text-gray-600">
          {t.source === 'app' && t.claimed_at ? '✓ Verified' : 'Unclaimed'} · {t.subject || 'ไม่ระบุวิชา'}
        </p>
      </td>
      <td className="px-3 py-3 text-gray-700">
        {t.origin_province}
        {t.origin_zone ? ` (${t.origin_zone})` : ''} → {t.destinations.map(destinationLabel).join(', ')}
      </td>
      <td className="px-3 py-3">
        <select
          value={t.admin_status}
          onChange={(e) => onStatusChange(t.id, e.target.value as AdminStatus)}
          className="mb-1 block rounded-lg border border-gray-300 px-2 py-1 text-xs"
          title="Internal outreach status"
        >
          {ADMIN_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="flex gap-3 text-xs">
          {t.facebook_url ? (
            <a
              href={t.facebook_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 hover:underline"
            >
              Profile
            </a>
          ) : (
            <span className="text-gray-400">No profile</span>
          )}
          {!t.claimed_at && t.invite_code && (
            <button
              onClick={() => navigator.clipboard.writeText(invitationUrl(t.invite_code!))}
              className="font-medium text-blue-600 hover:underline"
              title={invitationUrl(t.invite_code)}
            >
              Copy Invite Link
            </button>
          )}
        </div>
      </td>
    </>
  )
}

function EditTeacherModal({
  roles,
  teacher,
  onCancel,
  onSave,
}: {
  roles: { code: string; name_th: string; hasImplementation: boolean }[]
  teacher: AdminTeacher
  onCancel: () => void
  onSave: (updated: Partial<AdminTeacher>) => void
}) {
  const row = teacher as unknown as Record<string, unknown>
  // Fields come from the definitions of the role chosen in the dropdown, so a
  // new field or role shows up here without touching this modal.
  const [category, setCategory] = useState(teacher.category)
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = { facebook_url: teacher.facebook_url ?? '' }
    for (const f of adminEditableFields(getRoleFields(teacher.category))) {
      init[f.column] = row[f.column] == null ? '' : String(row[f.column])
    }
    return init
  })
  const fields = adminEditableFields(getRoleFields(category))

  function input(name: string, label: string, type: FieldType = 'text', options?: readonly string[]) {
    const cls =
      'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
    const set = (v: string) => setValues((prev) => ({ ...prev, [name]: v }))
    const value = values[name] ?? (row[name] == null ? '' : String(row[name]))
    return (
      <label key={name} className="block text-sm">
        <span className="block font-medium mb-1">{label}</span>
        {type === 'select' ? (
          <select value={value} onChange={(e) => set(e.target.value)} className={cls}>
            <option value="" />
            {options?.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type === 'number' ? 'number' : 'text'}
            value={value}
            onChange={(e) => set(e.target.value)}
            className={cls}
          />
        )}
      </label>
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const out: Record<string, unknown> = { category, facebook_url: values.facebook_url || null }
    for (const f of fields) {
      const v = values[f.column] ?? (row[f.column] == null ? '' : String(row[f.column]))
      out[f.column] = v === '' ? null : f.type === 'number' ? Number(v) : v
    }
    onSave(out as Partial<AdminTeacher>)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-lg font-bold mb-4">Edit {teacher.display_name}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm">
              <span className="block font-medium mb-1">Role</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {/* Only roles with code behind them: moving someone to a role
                    without one would break their matching and profile edits. */}
                {roles
                  .filter((r) => r.hasImplementation || r.code === category)
                  .map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.name_th}
                    </option>
                  ))}
                {!roles.some((r) => r.code === category) && (
                  <option value={category}>{category}</option>
                )}
              </select>
            </label>
          </div>
          {fields.map((f) => input(f.column, f.label, f.type, f.options))}
          {input('facebook_url', 'Facebook URL')}

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-200 font-medium py-2 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
