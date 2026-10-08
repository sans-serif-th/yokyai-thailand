'use client'

import { useState } from 'react'
import { BackHeader } from './back-header'
import type { Destination, ProfilePayload, Teacher } from '@/lib/types'

function splitDisplayName(displayName: string): [string, string] {
  const [first, ...rest] = displayName.trim().split(/\s+/)
  return [first ?? '', rest.join(' ')]
}

interface ProfileEditFormProps {
  teacher: Teacher
  destinations: Destination[]
  onSave: (payload: ProfilePayload) => Promise<void>
}

// Editing name only — everything else on the profile is passed through
// unchanged, since PUT /api/teachers replaces the whole record.
export function ProfileEditForm({ teacher, destinations, onSave }: ProfileEditFormProps) {
  const [firstName, setFirstName] = useState(() => splitDisplayName(teacher.display_name)[0])
  const [lastName, setLastName] = useState(() => splitDisplayName(teacher.display_name)[1])
  const [phone, setPhone] = useState(teacher.phone ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    if (!firstName.trim() || !lastName.trim()) {
      setError('กรุณากรอกชื่อและนามสกุล')
      return
    }
    if (phone.trim() && !/^[0-9+\-\s]{6,20}$/.test(phone.trim())) {
      setError('กรุณากรอกเบอร์โทรให้ถูกต้อง')
      return
    }
    setError(null)
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
        transferYear: teacher.transfer_year,
        facebookUrl: teacher.facebook_url,
        phone: phone.trim() || null,
        destinations: destinations.map((d) => ({
          province: d.province,
          district: d.district,
          zone: d.zone,
        })),
      })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-5 px-4 py-6">
      <BackHeader title="โปรไฟล์" href="/profile" />

      <label className="flex flex-col gap-1">
        <span className="text-[14px] font-semibold">ชื่อ</span>
        <input
          className="input-field"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-[14px] font-semibold">นามสกุล</span>
        <input
          className="input-field"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <span className="text-xs text-zinc-500">
          ชื่อ-นามสกุลของคุณจะถูกเก็บเป็นความลับและไม่แสดงต่อผู้อื่น
        </span>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-[14px] font-semibold">เบอร์โทร (ไม่บังคับ)</span>
        <input
          className="input-field"
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </label>

      {error && <p className="text-terracotta text-sm">{error}</p>}

      <button type="button" onClick={handleSave} disabled={saving} className="btn-brand-primary">
        {saving ? 'กำลังบันทึก...' : 'บันทึก'}
      </button>
    </div>
  )
}
