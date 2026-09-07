'use client'

import { useEffect, useState, useMemo } from 'react'
import type { AdminStatus, Round, Teacher, Destination } from '@/lib/types'
import { serviceTypeAbbr, SERVICE_TYPES } from '@/lib/service-types'

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
function toDatetimeLocal(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function isRoundInMatchingPhase(round: Round | null) {
  return !!round?.matching_opens_at && new Date(round.matching_opens_at) <= new Date()
}

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(false)
  const [token, setToken] = useState<string | null>(null)
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

  const [activeRound, setActiveRound] = useState<Round | null>(null)
  const [matchingOpensAtInput, setMatchingOpensAtInput] = useState('')
  const [savingRound, setSavingRound] = useState(false)

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
      setToken(storedToken)
      setAuthed(true)
      loadData(storedToken)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (!response.ok) {
        setPasswordError('Invalid password')
        return
      }

      const { token: newToken } = await response.json()
      localStorage.setItem('admin_token', newToken)
      setToken(newToken)
      setAuthed(true)
      setPassword('')
      loadData(newToken)
    } catch (err) {
      setPasswordError('Login failed')
    }
  }

  const loadData = async (authToken: string) => {
    setLoading(true)
    try {
      const [teachersRes, matchesRes, coverageRes, roundRes] = await Promise.all([
        fetch(`/api/admin/teachers?token=${encodeURIComponent(authToken)}`),
        fetch(`/api/admin/potential-matches?token=${encodeURIComponent(authToken)}`),
        fetch(`/api/admin/all-matches?token=${encodeURIComponent(authToken)}`),
        fetch(`/api/admin/round?token=${encodeURIComponent(authToken)}`),
      ])

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

      // A 404 here just means no round is configured yet — not a hard
      // error, since round management is a separate, optional concern.
      if (roundRes.ok) {
        const round = await roundRes.json()
        setActiveRound(round)
        setMatchingOpensAtInput(round.matching_opens_at ? toDatetimeLocal(round.matching_opens_at) : '')
      } else {
        console.error('Round API error:', roundRes.status)
      }
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    setToken(null)
    setAuthed(false)
    setPassword('')
    setTeachers([])
    setMatches([])
    setCoverage(null)
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

  // Registration-period / matching-phase gate on the active round (see
  // lib/rounds.ts, app/api/admin/round/route.ts). value is null to revert
  // to the registration phase, or an ISO string to schedule/open matching.
  const handleSaveRoundPhase = async (value: string | null) => {
    if (!token) return

    setActionError(null)
    setSavingRound(true)
    try {
      const res = await fetch(`/api/admin/round?token=${encodeURIComponent(token)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matching_opens_at: value }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setActionError(body.error || 'Failed to update round')
        return
      }
      const round = (await res.json()) as Round
      setActiveRound(round)
      setMatchingOpensAtInput(round.matching_opens_at ? toDatetimeLocal(round.matching_opens_at) : '')
    } catch (err) {
      setActionError((err as Error).message)
    } finally {
      setSavingRound(false)
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Admin Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password"
                autoFocus
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
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-2">
            <a
              href="/admin/master-data"
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Master Data
            </a>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
            >
              Logout
            </button>
          </div>
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
            Round {isRoundInMatchingPhase(activeRound) ? '🟢 Matching' : '🟡 Registration'}
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
                          {t.category === 'teacher' && 'ครู'}
                          {t.category === 'nurse' && 'พยาบาล'}
                          {t.category === 'physician' && 'แพทย์'}
                          {!['teacher', 'nurse', 'physician'].includes(t.category) && t.category}
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
              <div className="space-y-4">
                {matches.map((m, idx) => (
                  <div key={idx} className="bg-white rounded-lg shadow p-4 md:p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Unclaimed Seed */}
                      <div className="border-l-4 border-amber-500 pl-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-lg">{m.seed.display_name}</h3>
                            <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 mt-1">
                              Unclaimed (Facebook Import)
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1 mt-3">
                          <p>
                            <span className="font-medium">Position:</span> {m.seed.subject || '–'}
                          </p>
                          <p>
                            <span className="font-medium">From:</span> {m.seed.origin_province}
                          </p>
                          <p>
                            <span className="font-medium">To:</span>{' '}
                            {m.seed.destinations?.map((d) => d.province).join(', ')}
                          </p>
                        </div>
                      </div>

                      {/* Real User */}
                      <div className="border-l-4 border-green-500 pl-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-lg">{m.realUser.display_name}</h3>
                            <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                              ✓ Verified (App)
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1 mt-3">
                          <p>
                            <span className="font-medium">Position:</span> {m.realUser.subject || '–'}
                          </p>
                          <p>
                            <span className="font-medium">From:</span> {m.realUser.origin_province}
                          </p>
                          <p>
                            <span className="font-medium">To:</span>{' '}
                            {m.realUser.destinations?.map((d) => d.province).join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                      <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
                        Send Invite to Seed Owner
                      </button>
                    </div>
                  </div>
                ))}
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
              <div className="space-y-3">
                {coverage.pairs.map((p, idx) => (
                  <div key={idx} className="bg-white rounded-lg shadow p-4 grid md:grid-cols-2 gap-4">
                    <CoverageSide teacher={p.a} onStatusChange={handleStatusChange} />
                    <CoverageSide teacher={p.b} onStatusChange={handleStatusChange} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'round' && (
          <div className="bg-white rounded-lg shadow p-6 max-w-lg">
            <h2 className="text-lg font-bold mb-1">
              {activeRound ? `รอบ ${activeRound.label}` : 'ไม่มีรอบที่เปิดใช้งานอยู่'}
            </h2>
            {activeRound && (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  สถานะปัจจุบัน:{' '}
                  <span className="font-medium">
                    {isRoundInMatchingPhase(activeRound)
                      ? '🟢 เปิดให้ดูผลการจับคู่แล้ว'
                      : '🟡 ยังอยู่ในช่วงลงทะเบียน'}
                  </span>
                </p>
                <label className="block text-sm font-medium mb-1">
                  เวลาที่จะเปิดให้ดูผลการจับคู่ (matching_opens_at)
                </label>
                <input
                  type="datetime-local"
                  value={matchingOpensAtInput}
                  onChange={(e) => setMatchingOpensAtInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      handleSaveRoundPhase(
                        matchingOpensAtInput ? new Date(matchingOpensAtInput).toISOString() : null
                      )
                    }
                    disabled={savingRound}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {savingRound ? 'กำลังบันทึก...' : 'บันทึกเวลา'}
                  </button>
                  <button
                    onClick={() => handleSaveRoundPhase(new Date().toISOString())}
                    disabled={savingRound}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    เปิดทันที
                  </button>
                  <button
                    onClick={() => handleSaveRoundPhase(null)}
                    disabled={savingRound}
                    className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ย้อนกลับเป็นช่วงลงทะเบียน
                  </button>
                </div>
              </>
            )}
          </div>
        )}
          </>
        )}
      </div>

      {editingTeacher && (
        <EditTeacherModal
          teacher={editingTeacher}
          onCancel={() => setEditingTeacher(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  )
}

function CoverageSide({
  teacher: t,
  onStatusChange,
}: {
  teacher: AdminTeacher
  onStatusChange: (teacherId: string, status: AdminStatus) => void
}) {
  return (
    <div className="border-l-4 border-indigo-500 pl-3 space-y-1">
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium">{t.display_name}</p>
        <select
          value={t.admin_status}
          onChange={(e) => onStatusChange(t.id, e.target.value as AdminStatus)}
          className="text-xs border border-gray-300 rounded-lg px-2 py-1 shrink-0"
          title="Internal outreach status"
        >
          {ADMIN_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <p className="text-xs text-gray-600">
        {t.source === 'app' && t.claimed_at ? '✓ Verified' : 'Unclaimed'} · {t.subject || 'ไม่ระบุวิชา'}
      </p>
      <p className="text-xs text-gray-600">
        {t.origin_province}
        {t.origin_zone ? ` (${t.origin_zone})` : ''} →{' '}
        {t.destinations.map(destinationLabel).join(', ')}
      </p>
      <div className="flex gap-3 text-xs">
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
          <span className="text-gray-400">No profile</span>
        )}
        {!t.claimed_at && t.invite_code && (
          <button
            onClick={() => navigator.clipboard.writeText(invitationUrl(t.invite_code!))}
            className="text-blue-600 hover:underline font-medium"
            title={invitationUrl(t.invite_code)}
          >
            Copy Invite Link
          </button>
        )}
      </div>
    </div>
  )
}

function EditTeacherModal({
  teacher,
  onCancel,
  onSave,
}: {
  teacher: AdminTeacher
  onCancel: () => void
  onSave: (updated: Partial<AdminTeacher>) => void
}) {
  const [form, setForm] = useState({
    display_name: teacher.display_name,
    category: teacher.category,
    position: teacher.position,
    service_type: teacher.service_type,
    origin_province: teacher.origin_province,
    origin_district: teacher.origin_district ?? '',
    origin_zone: teacher.origin_zone ?? '',
    subject: teacher.subject ?? '',
    transfer_round: teacher.transfer_round ?? '',
    transfer_year: teacher.transfer_year?.toString() ?? '',
    facebook_url: teacher.facebook_url ?? '',
  })

  function field(name: keyof typeof form, label: string) {
    return (
      <label className="block text-sm">
        <span className="block font-medium mb-1">{label}</span>
        <input
          value={form[name]}
          onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </label>
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      ...form,
      transfer_year: form.transfer_year ? Number(form.transfer_year) : null,
      origin_district: form.origin_district || null,
      origin_zone: form.origin_zone || null,
      subject: form.subject || null,
      transfer_round: form.transfer_round || null,
      facebook_url: form.facebook_url || null,
    } as Partial<AdminTeacher>)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-lg font-bold mb-4">Edit {teacher.display_name}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          {field('display_name', 'Name')}
          <div className="grid grid-cols-2 gap-3">
            {field('category', 'Category')}
            {field('position', 'Position')}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {field('service_type', 'สพฐ (service type code)')}
            {field('subject', 'Subject')}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {field('origin_province', 'Origin Province')}
            {field('origin_zone', 'เขต (zone)')}
          </div>
          {field('origin_district', 'District')}
          <div className="grid grid-cols-2 gap-3">
            {field('transfer_round', 'Round')}
            {field('transfer_year', 'Year')}
          </div>
          {field('facebook_url', 'Facebook URL')}

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
