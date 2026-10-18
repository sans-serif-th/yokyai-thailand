'use client'

import { LINE_ID_PATTERN, PHONE_PATTERN, type ContactPatch } from '@/lib/profile-payload'
import Link from 'next/link'
import { useState } from 'react'
import { TopBar } from './top-bar'
import type { Teacher } from '@/lib/types'

function splitDisplayName(displayName: string): [string, string] {
  const [first, ...rest] = displayName.trim().split(/\s+/)
  return [first ?? '', rest.join(' ')]
}

interface ProfileEditFormProps {
  teacher: Teacher
  onSave: (patch: ContactPatch) => Promise<void>
}

// Figma "profile-edit" (188:1434). Edits name and contact only, sent as a
// partial update (PATCH /api/teachers/contact) so the rest of the profile —
// whatever fields the user's role has — is never re-sent or overwritten.
export function ProfileEditForm({ teacher, onSave }: ProfileEditFormProps) {
  const [firstName, setFirstName] = useState(() => splitDisplayName(teacher.display_name)[0])
  const [lastName, setLastName] = useState(() => splitDisplayName(teacher.display_name)[1])
  const [phone, setPhone] = useState(teacher.phone ?? '')
  const [lineId, setLineId] = useState(teacher.line_id ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    if (!firstName.trim() || !lastName.trim()) {
      setError('กรุณากรอกชื่อและนามสกุล')
      return
    }
    if (phone.trim() && !PHONE_PATTERN.test(phone.trim())) {
      setError('กรุณากรอกเบอร์โทรให้ถูกต้อง')
      return
    }
    if (lineId.trim() && !LINE_ID_PATTERN.test(lineId.trim())) {
      setError('LINE ID ไม่ถูกต้อง (4-20 ตัว ใช้ตัวอักษร ตัวเลข . - _ ได้)')
      return
    }
    setError(null)
    setSaving(true)
    try {
      await onSave({
        displayName: `${firstName.trim()} ${lastName.trim()}`.trim(),
        phone: phone.trim() || null,
        lineId: lineId.trim() || null,
      })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-5 px-4 pb-6">
      <TopBar title="แก้ไขโปรไฟล์" backHref="/profile" />

      <div className="flex justify-center" aria-hidden>
        <div className="size-[97px] rounded-full bg-brand-red" />
      </div>

      <div className="flex flex-1 flex-col gap-[13px]">
        <label className="flex flex-col gap-1">
          <span className="text-[14px] font-semibold leading-[21px]">ชื่อ*</span>
          <input
            className="input-field"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[14px] font-semibold leading-[21px]">นามสกุล*</span>
          <input
            className="input-field"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[14px] font-semibold leading-[21px]">LINE ID</span>
          <input
            className="input-field"
            autoCapitalize="none"
            autoCorrect="off"
            value={lineId}
            onChange={(e) => setLineId(e.target.value)}
          />
          <span className="text-[12px] leading-[18px] text-zinc-500">
            แสดงให้คู่ที่คุณยอมรับคำขอติดต่อเห็นเท่านั้น
          </span>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[14px] font-semibold leading-[21px]">เบอร์โทร (ไม่บังคับ)</span>
          <input
            className="input-field"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>

        {error && <p className="text-terracotta text-sm">{error}</p>}
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/profile"
          className="btn-brand-secondary flex h-[44px] flex-1 items-center justify-center py-0 text-[14px] font-normal"
        >
          ยกเลิก
        </Link>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn-brand-primary h-[44px] flex-1 border border-transparent py-0 text-[14px] font-normal"
        >
          {saving ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
      </div>
    </div>
  )
}
