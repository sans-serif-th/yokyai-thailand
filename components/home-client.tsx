'use client'

import { useCallback, useEffect, useState } from 'react'
import { getLiffIdToken, initLiff } from '@/lib/liff'
import { ProfileForm } from './profile-form'
import { MatchList } from './match-list'
import type { Destination, MatchResult, ProfilePayload, Teacher } from '@/lib/types'

type View = 'loading' | 'profile' | 'matches' | 'error'

async function authedFetch(path: string, idToken: string, init?: RequestInit) {
  const res = await fetch(path, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${idToken}`,
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    },
  })
  const body = await res.json()
  if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`)
  return body
}

export function HomeClient() {
  const [view, setView] = useState<View>('loading')
  const [idToken, setIdToken] = useState<string | null>(null)
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)

  const loadMatches = useCallback(async (token: string) => {
    const { matches } = await authedFetch('/api/matches', token)
    setMatches(matches)
  }, [])

  useEffect(() => {
    async function bootstrap() {
      try {
        await initLiff()
        const token = getLiffIdToken()
        setIdToken(token)

        const profile = await authedFetch('/api/teachers', token)
        setTeacher(profile.teacher)
        setDestinations(profile.destinations ?? [])

        if (profile.teacher) {
          await loadMatches(token)
          setView('matches')
        } else {
          setView('profile')
        }
      } catch (err) {
        setErrorMessage((err as Error).message)
        setView('error')
      }
    }
    bootstrap()
  }, [loadMatches])

  async function handleSaveProfile(payload: ProfilePayload) {
    if (!idToken) throw new Error('Not logged in')
    const { teacher: saved } = await authedFetch('/api/teachers', idToken, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
    setTeacher(saved)
    setDestinations(payload.destinations.map((d) => ({ ...d, id: '', teacher_id: saved.id })))
    setEditing(false)
    await loadMatches(idToken)
    setView('matches')
  }

  if (view === 'loading') {
    return <p className="text-center p-8 text-zinc-600">กำลังโหลด... (Loading...)</p>
  }

  if (view === 'error') {
    return <p className="text-center p-8 text-red-600">{errorMessage}</p>
  }

  if (view === 'profile' || editing) {
    return (
      <ProfileForm
        initialTeacher={teacher}
        initialDestinations={destinations}
        onSave={handleSaveProfile}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="max-w-lg mx-auto w-full px-4 flex justify-end">
        <button
          onClick={() => setEditing(true)}
          className="text-sm text-blue-600 underline"
        >
          แก้ไขโปรไฟล์ (Edit profile)
        </button>
      </div>
      <MatchList matches={matches} />
    </div>
  )
}
