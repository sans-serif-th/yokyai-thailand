'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getLiffProfile, liffLogout } from '@/lib/liff'
import type { Destination, ProfilePayload, Teacher } from '@/lib/types'

function splitDisplayName(displayName: string): [string, string] {
  const [first, ...rest] = displayName.trim().split(/\s+/)
  return [first ?? '', rest.join(' ')]
}

interface LineProfile {
  displayName: string
  pictureUrl?: string
}

interface ProfileSettingsFormProps {
  teacher: Teacher
  initialDestinations: Destination[]
  onSave: (payload: ProfilePayload) => Promise<void>
  onLoggedOut: () => void
}

export function ProfileSettingsForm({
  teacher,
  initialDestinations,
  onSave,
  onLoggedOut,
}: ProfileSettingsFormProps) {
  const [firstName, setFirstName] = useState(() => splitDisplayName(teacher.display_name)[0])
  const [lastName, setLastName] = useState(() => splitDisplayName(teacher.display_name)[1])
  const [lineProfile, setLineProfile] = useState<LineProfile | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let cancelled = false
    getLiffProfile()
      .then((profile) => {
        if (!cancelled) setLineProfile(profile)
      })
      .catch(() => {
        // Non-critical — the page still works without the LINE profile card.
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function handleSave() {
    if (!firstName.trim() || !lastName.trim()) {
      setError('กรุณากรอกชื่อและนามสกุล')
      return
    }
    setError(null)
    setSaved(false)
    setSaving(true)
    try {
      await onSave({
        displayName: `${firstName.trim()} ${lastName.trim()}`.trim(),
        position: teacher.position,
        serviceType: teacher.service_type,
        originProvince: teacher.origin_province,
        originDistrict: teacher.origin_district,
        originZone: teacher.origin_zone,
        currentSchool: teacher.current_school,
        teachingGroup: teacher.teaching_group,
        subject: teacher.subject,
        benefitNote: teacher.benefit_note,
        transferRound: teacher.transfer_round,
        destinations: initialDestinations.map((d) => ({
          province: d.province,
          district: d.district,
          zone: d.zone,
        })),
      })
      setSaved(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  function handleLogout() {
    liffLogout()
    onLoggedOut()
  }

  return (
    <div className="flex flex-col gap-5 max-w-lg mx-auto p-4">
      <h1 className="text-xl font-semibold">โปรไฟล์</h1>

      {lineProfile && (
        <div className="flex items-center gap-3 card-surface">
          {lineProfile.pictureUrl && (
            <Image
              src={lineProfile.pictureUrl}
              alt=""
              width={48}
              height={48}
              className="rounded-full"
              unoptimized
            />
          )}
          <div>
            <p className="text-xs text-zinc-500">บัญชี LINE</p>
            <p className="text-sm font-medium">{lineProfile.displayName}</p>
          </div>
        </div>
      )}

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">ชื่อ</span>
        <input
          className="input-field"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">นามสกุล</span>
        <input
          className="input-field"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </label>

      {error && <p className="text-terracotta text-sm">{error}</p>}
      {saved && <p className="text-sm text-sage-dark">บันทึกแล้ว</p>}

      <button type="button" onClick={handleSave} disabled={saving} className="btn-primary">
        {saving ? 'กำลังบันทึก...' : 'บันทึก'}
      </button>

      <hr className="border-sage" />

      <Link href="/terms" className="text-sm link-accent">
        ข้อกำหนดและเงื่อนไข
      </Link>

      <button type="button" onClick={handleLogout} className="btn-danger-outline">
        ออกจากระบบ
      </button>
    </div>
  )
}
