'use client'

import Link from 'next/link'
import { useState } from 'react'
import { POSITIONS, requiresTeachingGroup, type PositionCode } from '@/lib/positions'
import type { ServiceTypeCode } from '@/lib/service-types'
import { OriginFields } from './origin-fields'
import { DestinationFields, type DestinationDraft } from './destination-fields'
import type { Destination, ProfilePayload, Teacher } from '@/lib/types'

// 0 is the career-category picker — a gate before the numbered steps, so
// adding a future career (e.g. เภสัชกร, พยาบาล, แพทย์) to lib/positions.ts
// is the only change needed to offer it here.
type Step = 0 | 1 | 2 | 3

const STEP_TITLES: Record<Exclude<Step, 0>, string> = {
  1: 'ข้อมูลต้นทาง',
  2: 'ปลายทางที่ต้องการ',
  3: 'ข้อมูลติดต่อ',
}

// Impure (reads wall-clock time), so it must only ever be called from a
// useState lazy initializer (runs once, at mount) or an event handler —
// never directly in the render body (react-hooks/purity forbids that).
function upcomingTransferYears(): number[] {
  const currentYear = new Date().getFullYear()
  return [currentYear + 1, currentYear + 2, currentYear + 3]
}

function splitDisplayName(displayName: string | undefined): [string, string] {
  if (!displayName) return ['', '']
  const [first, ...rest] = displayName.trim().split(/\s+/)
  return [first ?? '', rest.join(' ')]
}

interface ProfileFormProps {
  initialTeacher: Teacher | null
  initialDestinations: Destination[]
  onSave: (payload: ProfilePayload) => Promise<void>
}

export function ProfileForm({ initialTeacher, initialDestinations, onSave }: ProfileFormProps) {
  const [step, setStep] = useState<Step>(initialTeacher?.position ? 1 : 0)

  // Step 1 — ข้อมูลต้นทาง
  const [position, setPosition] = useState<PositionCode | ''>(initialTeacher?.position ?? '')
  const [serviceType, setServiceType] = useState<ServiceTypeCode | ''>(
    initialTeacher?.service_type ?? ''
  )
  const [originProvince, setOriginProvince] = useState(initialTeacher?.origin_province ?? '')
  const [originDistrict, setOriginDistrict] = useState(initialTeacher?.origin_district ?? '')
  const [originZone, setOriginZone] = useState(initialTeacher?.origin_zone ?? '')
  const [currentSchool, setCurrentSchool] = useState(initialTeacher?.current_school ?? '')
  const [teachingGroup, setTeachingGroup] = useState(initialTeacher?.teaching_group ?? '')
  const [subject, setSubject] = useState(initialTeacher?.subject ?? '')
  const [transferRound, setTransferRound] = useState<number | ''>(
    initialTeacher?.transfer_round ?? ''
  )
  const [benefitNote, setBenefitNote] = useState(initialTeacher?.benefit_note ?? '')
  const [transferYearOptions] = useState<number[]>(() => upcomingTransferYears())

  // Step 2 — ปลายทาง
  const [destinations, setDestinations] = useState<DestinationDraft[]>(
    initialDestinations.length
      ? initialDestinations.map((d) => ({
          province: d.province,
          district: d.district ?? '',
          zone: d.zone ?? '',
        }))
      : [{ province: '', district: '', zone: '' }]
  )

  // Step 3 — ข้อมูลติดต่อ
  const [firstName, setFirstName] = useState(
    () => splitDisplayName(initialTeacher?.display_name)[0]
  )
  const [lastName, setLastName] = useState(
    () => splitDisplayName(initialTeacher?.display_name)[1]
  )
  const [termsAccepted, setTermsAccepted] = useState(false)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handlePositionChange(value: string) {
    setPosition(value as PositionCode | '')
    if (!requiresTeachingGroup(value)) {
      setTeachingGroup('')
      setSubject('')
    }
  }

  function handleSelectCategory(value: PositionCode) {
    handlePositionChange(value)
    setError(null)
    setStep(1)
  }

  function handleServiceTypeChange(value: string) {
    setServiceType(value as ServiceTypeCode | '')
    // Zone options depend on service type — clear selections that may no
    // longer be valid.
    setOriginZone('')
    setDestinations((prev) => prev.map((d) => ({ ...d, zone: '' })))
  }

  function handleOriginProvinceChange(value: string) {
    setOriginProvince(value)
    setOriginDistrict('')
    setOriginZone('')
  }

  function updateDestination(index: number, field: keyof DestinationDraft, value: string) {
    setDestinations((prev) =>
      prev.map((d, i) => {
        if (i !== index) return d
        if (field === 'province') {
          // District/zone options depend on province — clear stale selections.
          return { province: value, district: '', zone: '' }
        }
        return { ...d, [field]: value }
      })
    )
  }

  function addDestination() {
    setDestinations((prev) => [...prev, { province: '', district: '', zone: '' }])
  }

  function removeDestination(index: number) {
    setDestinations((prev) => prev.filter((_, i) => i !== index))
  }

  function validateStep1(): string | null {
    if (!position) return 'กรุณาเลือกตำแหน่ง'
    if (!serviceType) return 'กรุณาเลือกหน่วยงานต้นสังกัด'
    if (!originProvince) return 'กรุณาเลือกจังหวัดต้นทาง'
    if (requiresTeachingGroup(position) && !teachingGroup) return 'กรุณาเลือกกลุ่มสาระการเรียนรู้'
    return null
  }

  function validateStep2(): string | null {
    if (!destinations.some((d) => d.province.trim())) {
      return 'กรุณาเพิ่มปลายทางอย่างน้อย 1 แห่ง'
    }
    return null
  }

  function validateStep3(): string | null {
    if (!firstName.trim() || !lastName.trim()) return 'กรุณากรอกชื่อและนามสกุล'
    if (!termsAccepted) return 'กรุณายอมรับข้อกำหนดและเงื่อนไขก่อนบันทึกโปรไฟล์'
    return null
  }

  function goNext() {
    const validationError = step === 1 ? validateStep1() : step === 2 ? validateStep2() : null
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    setStep((s) => (s < 3 ? ((s + 1) as Step) : s))
  }

  function goBack() {
    setError(null)
    setStep((s) => (s > 0 ? ((s - 1) as Step) : s))
  }

  async function handleSave() {
    const validationError = validateStep1() ?? validateStep2() ?? validateStep3()
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)

    const validDestinations = destinations.filter((d) => d.province.trim())
    const isTeacher = requiresTeachingGroup(position)

    setSaving(true)
    try {
      await onSave({
        displayName: `${firstName.trim()} ${lastName.trim()}`.trim(),
        position,
        serviceType,
        originProvince,
        originDistrict: originDistrict.trim() || null,
        originZone: originZone.trim() || null,
        currentSchool: currentSchool.trim() || null,
        teachingGroup: isTeacher ? teachingGroup : null,
        subject: isTeacher ? subject.trim() || null : null,
        benefitNote: benefitNote.trim() || null,
        transferRound: transferRound || null,
        destinations: validDestinations.map((d) => ({
          province: d.province,
          district: d.district.trim() || null,
          zone: d.zone.trim() || null,
        })),
      })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-5 max-w-lg mx-auto p-4">
      <h1 className="text-xl font-semibold">โปรไฟล์ครู</h1>

      {step > 0 && (
        <div className="flex justify-between text-sm">
          {([1, 2, 3] as const).map((s) => (
            <span key={s} className={s === step ? 'font-semibold text-black' : 'text-zinc-400'}>
              {s}. {STEP_TITLES[s]}
            </span>
          ))}
        </div>
      )}

      {step === 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-zinc-600">เลือกสายงานของคุณเพื่อเริ่มกรอกข้อมูล</p>
          {POSITIONS.map((p) => (
            <button
              key={p.code}
              type="button"
              onClick={() => handleSelectCategory(p.code)}
              className="border rounded px-4 py-3 text-left hover:border-black"
            >
              {p.nameTh}
            </button>
          ))}
        </div>
      )}

      {step === 1 && (
        <OriginFields
          position={position}
          onPositionChange={handlePositionChange}
          serviceType={serviceType}
          onServiceTypeChange={handleServiceTypeChange}
          originProvince={originProvince}
          onOriginProvinceChange={handleOriginProvinceChange}
          originDistrict={originDistrict}
          onOriginDistrictChange={setOriginDistrict}
          originZone={originZone}
          onOriginZoneChange={setOriginZone}
          currentSchool={currentSchool}
          onCurrentSchoolChange={setCurrentSchool}
          teachingGroup={teachingGroup}
          onTeachingGroupChange={setTeachingGroup}
          subject={subject}
          onSubjectChange={setSubject}
          transferRound={transferRound}
          onTransferRoundChange={setTransferRound}
          transferYearOptions={transferYearOptions}
          benefitNote={benefitNote}
          onBenefitNoteChange={setBenefitNote}
        />
      )}

      {step === 2 && (
        <DestinationFields
          serviceType={serviceType}
          destinations={destinations}
          onUpdateDestination={updateDestination}
          onAddDestination={addDestination}
          onRemoveDestination={removeDestination}
        />
      )}

      {step === 3 && (
        <>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">ชื่อ</span>
            <input
              className="border rounded px-3 py-2"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">นามสกุล</span>
            <input
              className="border rounded px-3 py-2"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </label>

          <p className="text-sm text-zinc-600">
            ไม่ต้องกรอกเบอร์โทรศัพท์ — เมื่อจับคู่สำเร็จ ระบบจะให้คุณติดต่อกันผ่าน LINE
          </p>

          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            <span>
              ฉันยอมรับ{' '}
              <Link href="/terms" target="_blank" className="text-blue-600 underline">
                ข้อกำหนดและเงื่อนไข
              </Link>
            </span>
          </label>
        </>
      )}

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {step > 0 && (
        <div className="flex justify-between gap-3">
          <button
            type="button"
            onClick={goBack}
            className="border rounded px-4 py-2"
          >
            ย้อนกลับ
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={goNext}
              className="bg-black text-white rounded px-4 py-2"
            >
              ถัดไป
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !termsAccepted}
              className="bg-black text-white rounded px-4 py-2 disabled:opacity-50"
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึกโปรไฟล์'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
