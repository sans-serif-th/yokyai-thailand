'use client'

import Link from 'next/link'
import { useState } from 'react'
import { POSITIONS, requiresTeachingGroup, type PositionCode } from '@/lib/positions'
import type { ServiceTypeCode } from '@/lib/service-types'
import { OriginFields, splitSubjects, joinSubjects } from './origin-fields'
import { DestinationFields, findDuplicateProvince, type DestinationDraft } from './destination-fields'
import { FREE_DESTINATION_LIMIT } from '@/lib/package-limits'
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

// Cycled by index for the career-category cards — adding a 3rd/4th career
// later just continues the cycle, no new design decision needed.
const CATEGORY_CARD_COLORS = ['bg-lavender', 'bg-sungold']

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
  const [subjects, setSubjects] = useState<string[]>(() =>
    splitSubjects(initialTeacher?.subject ?? null)
  )
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
  const [facebookUrl, setFacebookUrl] = useState(initialTeacher?.facebook_url ?? '')
  const [termsAccepted, setTermsAccepted] = useState(false)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handlePositionChange(value: string) {
    setPosition(value as PositionCode | '')
    if (!requiresTeachingGroup(value)) {
      setTeachingGroup('')
      setSubjects([''])
    }
  }

  function updateSubject(index: number, value: string) {
    setSubjects((prev) => prev.map((s, i) => (i === index ? value : s)))
  }

  function addSubject() {
    setSubjects((prev) => [...prev, ''])
  }

  function removeSubject(index: number) {
    setSubjects((prev) => prev.filter((_, i) => i !== index))
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
    setDestinations((prev) =>
      prev.length >= FREE_DESTINATION_LIMIT ? prev : [...prev, { province: '', district: '', zone: '' }]
    )
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
    const duplicateProvince = findDuplicateProvince(destinations)
    if (duplicateProvince) {
      return `จังหวัด "${duplicateProvince}" ถูกเพิ่มซ้ำ กรุณาเลือกจังหวัดอื่นหรือลบรายการที่ซ้ำออก`
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
        subject: isTeacher ? joinSubjects(subjects) : null,
        benefitNote: benefitNote.trim() || null,
        transferRound: transferRound || null,
        facebookUrl: facebookUrl.trim() || null,
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
            <span
              key={s}
              className={s === step ? 'font-semibold text-terracotta' : 'text-zinc-400'}
            >
              {s}. {STEP_TITLES[s]}
            </span>
          ))}
        </div>
      )}

      {step === 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-zinc-600">เลือกสายงานของคุณเพื่อเริ่มกรอกข้อมูล</p>
          {POSITIONS.map((p, i) => (
            <button
              key={p.code}
              type="button"
              onClick={() => handleSelectCategory(p.code)}
              className={`rounded-3xl border border-sage px-4 py-3 text-left font-medium ${CATEGORY_CARD_COLORS[i % CATEGORY_CARD_COLORS.length]}`}
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
          subjects={subjects}
          onUpdateSubject={updateSubject}
          onAddSubject={addSubject}
          onRemoveSubject={removeSubject}
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
          maxDestinations={FREE_DESTINATION_LIMIT}
          showUpgradeLink={false}
        />
      )}

      {step === 3 && (
        <>
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

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">ลิงก์ Facebook (ไม่บังคับ)</span>
            <input
              className="input-field"
              value={facebookUrl}
              onChange={(e) => setFacebookUrl(e.target.value)}
              placeholder="https://facebook.com/..."
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
              <Link href="/terms" target="_blank" className="link-accent">
                ข้อกำหนดและเงื่อนไข
              </Link>
            </span>
          </label>
        </>
      )}

      {error && <p className="text-terracotta text-sm">{error}</p>}

      {step > 0 && (
        <div className="flex justify-between gap-3">
          <button type="button" onClick={goBack} className="btn-secondary">
            ย้อนกลับ
          </button>

          {step < 3 ? (
            <button type="button" onClick={goNext} className="btn-primary">
              ถัดไป
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !termsAccepted}
              className="btn-primary"
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึกโปรไฟล์'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
