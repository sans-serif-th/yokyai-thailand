'use client'

import { useEffect, useState, useMemo } from 'react'
import type { Teacher, Destination } from '@/lib/types'

type TabType = 'teachers' | 'matches'

interface PotentialMatch {
  seed: Teacher & { destinations: Destination[] }
  realUser: Teacher & { destinations: Destination[] }
}

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [teachers, setTeachers] = useState<(Teacher & { destinations: Destination[] })[]>([])
  const [matches, setMatches] = useState<PotentialMatch[]>([])
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<TabType>('teachers')

  // Filters
  const [sourceFilter, setSourceFilter] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [originFilter, setOriginFilter] = useState('')
  const [destinationFilter, setDestinationFilter] = useState('')

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
      const [teachersRes, matchesRes] = await Promise.all([
        fetch(`/api/admin/teachers?token=${encodeURIComponent(authToken)}`),
        fetch(`/api/admin/potential-matches?token=${encodeURIComponent(authToken)}`),
      ])

      if (!teachersRes.ok) {
        console.error('Teachers API error:', teachersRes.status)
        return
      }
      if (!matchesRes.ok) {
        console.error('Matches API error:', matchesRes.status)
        return
      }

      const teachers = await teachersRes.json()
      const matches = await matchesRes.json()
      setTeachers(teachers)
      setMatches(matches)
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
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
          >
            Logout
          </button>
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
            Potential Matches ({matches.length})
          </button>
        </div>

        {tab === 'teachers' && (
          <div>
            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Sources</option>
                  <option value="app">App User</option>
                  <option value="facebook_import">Facebook Import</option>
                </select>
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Subjects</option>
                  {[...new Set(teachers.map((t) => t.subject).filter(Boolean) as string[])].map((s) => (
                    <option key={s} value={s}>
                      {s}
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
                      {p}
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
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Teachers List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b border-gray-300">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Name</th>
                    <th className="px-4 py-3 text-left font-medium">Category</th>
                    <th className="px-4 py-3 text-left font-medium">Source</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Subject</th>
                    <th className="px-4 py-3 text-left font-medium">Origin</th>
                    <th className="px-4 py-3 text-left font-medium">Destinations</th>
                    <th className="px-4 py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {teachers.map((t) => (
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
                      <td className="px-4 py-3 text-xs">
                        {t.destinations?.map((d) => d.province).join(', ') || '–'}
                      </td>
                      <td className="px-4 py-3 space-x-2">
                        <button className="text-blue-600 hover:underline text-xs font-medium">
                          Edit
                        </button>
                        <button className="text-red-600 hover:underline text-xs font-medium">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
      </div>
    </div>
  )
}
