'use client'

import { useState } from 'react'
import { TEACHING_GROUPS } from '@/lib/teaching-groups'
import { THAI_PROVINCES } from '@/lib/provinces'
import type { Destination, ProfilePayload, Teacher } from '@/lib/types'

interface DestinationDraft {
  province: string
  district: string
}

// Impure (reads wall-clock time), so it must only ever be called from a
// useState lazy initializer (runs once, at mount) or an event handler —
// never directly in the render body (react-hooks/purity forbids that).
function computeMonthsOfService(dateStr: string): number {
  return Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  )
}

interface ProfileFormProps {
  initialTeacher: Teacher | null
  initialDestinations: Destination[]
  onSave: (payload: ProfilePayload) => Promise<void>
}

export function ProfileForm({ initialTeacher, initialDestinations, onSave }: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(initialTeacher?.display_name ?? '')
  const [originProvince, setOriginProvince] = useState(initialTeacher?.origin_province ?? '')
  const [originDistrict, setOriginDistrict] = useState(initialTeacher?.origin_district ?? '')
  const [currentSchool, setCurrentSchool] = useState(initialTeacher?.current_school ?? '')
  const [teachingGroup, setTeachingGroup] = useState(initialTeacher?.teaching_group ?? '')
  const [subject, setSubject] = useState(initialTeacher?.subject ?? '')
  const [serviceStartDate, setServiceStartDate] = useState(initialTeacher?.service_start_date ?? '')
  const [destinations, setDestinations] = useState<DestinationDraft[]>(
    initialDestinations.length
      ? initialDestinations.map((d) => ({ province: d.province, district: d.district ?? '' }))
      : [{ province: '', district: '' }]
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [monthsOfService, setMonthsOfService] = useState<number | null>(() =>
    initialTeacher?.service_start_date
      ? computeMonthsOfService(initialTeacher.service_start_date)
      : null
  )

  function handleServiceStartDateChange(value: string) {
    setServiceStartDate(value)
    setMonthsOfService(value ? computeMonthsOfService(value) : null)
  }

  function updateDestination(index: number, field: keyof DestinationDraft, value: string) {
    setDestinations((prev) =>
      prev.map((d, i) => (i === index ? { ...d, [field]: value } : d))
    )
  }

  function addDestination() {
    setDestinations((prev) => [...prev, { province: '', district: '' }])
  }

  function removeDestination(index: number) {
    setDestinations((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const validDestinations = destinations.filter((d) => d.province.trim())
    if (!displayName.trim() || !originProvince || !teachingGroup || validDestinations.length === 0) {
      setError('กรุณากรอกชื่อ, จังหวัดต้นทาง, กลุ่มสาระการเรียนรู้ และปลายทางอย่างน้อย 1 แห่ง')
      return
    }

    setSaving(true)
    try {
      await onSave({
        displayName: displayName.trim(),
        originProvince,
        originDistrict: originDistrict.trim() || null,
        currentSchool: currentSchool.trim() || null,
        teachingGroup,
        subject: subject.trim() || null,
        serviceStartDate: serviceStartDate || null,
        destinations: validDestinations.map((d) => ({
          province: d.province,
          district: d.district.trim() || null,
        })),
      })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-lg mx-auto p-4">
      <h1 className="text-xl font-semibold">โปรไฟล์ครู</h1>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">ชื่อ-นามสกุล</span>
        <input
          className="border rounded px-3 py-2"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">โรงเรียนปัจจุบัน (ไม่บังคับ)</span>
        <input
          className="border rounded px-3 py-2"
          value={currentSchool}
          onChange={(e) => setCurrentSchool(e.target.value)}
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">ต้นทาง — จังหวัด</span>
          <select
            className="border rounded px-3 py-2"
            value={originProvince}
            onChange={(e) => setOriginProvince(e.target.value)}
            required
          >
            <option value="">เลือกจังหวัด</option>
            {THAI_PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">อำเภอ/เขต (ไม่บังคับ)</span>
          <input
            className="border rounded px-3 py-2"
            value={originDistrict}
            onChange={(e) => setOriginDistrict(e.target.value)}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">กลุ่มสาระการเรียนรู้</span>
        <select
          className="border rounded px-3 py-2"
          value={teachingGroup}
          onChange={(e) => setTeachingGroup(e.target.value)}
          required
        >
          <option value="">เลือกกลุ่มสาระ</option>
          {TEACHING_GROUPS.map((g) => (
            <option key={g.code} value={g.code}>
              {g.nameTh}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">วิชาเอก (ไม่บังคับ — ใช้สำหรับกรองผลลัพธ์)</span>
        <input
          className="border rounded px-3 py-2"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="เช่น คณิตศาสตร์"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">วันที่เริ่มปฏิบัติงานที่โรงเรียนปัจจุบัน (ไม่บังคับ)</span>
        <input
          type="date"
          className="border rounded px-3 py-2"
          value={serviceStartDate}
          onChange={(e) => handleServiceStartDateChange(e.target.value)}
        />
        {monthsOfService !== null && monthsOfService < 24 && (
          <p className="text-amber-600 text-sm">
            ⚠️ คุณมีอายุงาน {monthsOfService} เดือน — โดยทั่วไปเกณฑ์การย้ายสับเปลี่ยนกำหนดขั้นต่ำ 24 เดือน
            ระบบจะไม่บล็อกการใช้งานส่วนนี้ แต่โรงเรียน/เขตพื้นที่ของคุณจะตรวจสอบคุณสมบัติอีกครั้งในขั้นตอนการอนุมัติ
          </p>
        )}
      </label>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">ปลายทาง — จังหวัดที่ต้องการย้ายไป</span>
        {destinations.map((d, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <select
              className="border rounded px-3 py-2"
              value={d.province}
              onChange={(e) => updateDestination(i, 'province', e.target.value)}
            >
              <option value="">เลือกจังหวัด</option>
              {THAI_PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <input
              className="border rounded px-3 py-2"
              placeholder="อำเภอ/เขต (ไม่บังคับ)"
              value={d.district}
              onChange={(e) => updateDestination(i, 'district', e.target.value)}
            />
            <button
              type="button"
              onClick={() => removeDestination(i)}
              className="text-red-600 px-2"
              aria-label="ลบปลายทางนี้"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addDestination}
          className="self-start text-sm text-blue-600 underline"
        >
          + เพิ่มปลายทาง
        </button>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="bg-black text-white rounded px-4 py-2 disabled:opacity-50"
      >
        {saving ? 'กำลังบันทึก...' : 'บันทึกโปรไฟล์'}
      </button>
    </form>
  )
}
