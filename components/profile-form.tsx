'use client'

import Link from 'next/link'
import { useState } from 'react'
import { IdCardIcon } from './icons'
import { requiresTeachingGroup, type PositionCode } from '@/lib/positions'
import type { ServiceTypeCode } from '@/lib/service-types'
import { OriginFields, splitSubjects, joinSubjects } from './origin-fields'
import { autoZone } from '@/lib/education-zones'
import {
  DestinationFields,
  findDuplicateProvince,
  type DestinationDraft,
} from './destination-fields'
import { FREE_DESTINATION_LIMIT } from '@/lib/package-limits'
import { upcomingTransferYears } from '@/lib/transfer-rounds'
import { OnboardingWelcome } from './onboarding-welcome'
import { StepProgress } from './step-progress'
import { SectionHeader } from './section-header'
import { TransferFields } from './transfer-fields'
import type { Destination, ProfilePayload, Teacher } from '@/lib/types'

// -1 is the welcome screen (professional-category gate, see
// onboarding-welcome.tsx) — shown once, before the numbered steps.
type Step = -1 | 1 | 2 | 3

const STEP_TITLES: Record<Exclude<Step, -1>, string> = {
  1: 'ข้อมูลต้นทาง',
  2: 'ปลายทางที่ค้นหา',
  3: 'ข้อมูลติดต่อ',
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
  const [step, setStep] = useState<Step>(initialTeacher?.position ? 1 : -1)

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
  const [transferRound, setTransferRound] = useState(initialTeacher?.transfer_round ?? '')
  const [transferYear, setTransferYear] = useState(
    initialTeacher?.transfer_year ? String(initialTeacher.transfer_year) : ''
  )
  const [benefitNote, setBenefitNote] = useState(initialTeacher?.benefit_note ?? '')
  const [transferYearOptions] = useState(() => upcomingTransferYears())

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
  const [lastName, setLastName] = useState(() => splitDisplayName(initialTeacher?.display_name)[1])
  const [phone, setPhone] = useState(initialTeacher?.phone ?? '')
  const [termsAccepted, setTermsAccepted] = useState(false)
  // Optional marketing opt-in, not persisted anywhere (same as
  // termsAccepted, which is also purely a client-side save gate) — see
  // components/onboarding-welcome.tsx's comment on category for the same
  // pattern.
  const [lineConsent, setLineConsent] = useState(false)

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

  function handleServiceTypeChange(value: string) {
    const nextServiceType = value as ServiceTypeCode | ''
    setServiceType(nextServiceType)
    // Zone depends on service type — recompute (or auto-fill) for the new one.
    setOriginZone(autoZone(nextServiceType, originProvince, originDistrict))
    setDestinations((prev) =>
      prev.map((d) => ({
        ...d,
        zone: autoZone(nextServiceType, d.province, d.district),
      }))
    )
  }

  function handleOriginProvinceChange(value: string) {
    setOriginProvince(value)
    setOriginDistrict('')
    setOriginZone(autoZone(serviceType, value, ''))
  }

  function handleOriginDistrictChange(value: string) {
    setOriginDistrict(value)
    setOriginZone(autoZone(serviceType, originProvince, value))
  }

  function updateDestination(index: number, field: keyof DestinationDraft, value: string) {
    setDestinations((prev) =>
      prev.map((d, i) => {
        if (i !== index) return d
        if (field === 'province') {
          return {
            province: value,
            district: '',
            zone: autoZone(serviceType, value, ''),
          }
        }
        if (field === 'district') {
          return {
            ...d,
            district: value,
            zone: autoZone(serviceType, d.province, value),
          }
        }
        return { ...d, [field]: value }
      })
    )
  }

  function addDestination() {
    setDestinations((prev) =>
      prev.length >= FREE_DESTINATION_LIMIT
        ? prev
        : [...prev, { province: '', district: '', zone: '' }]
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
    if (!transferRound) return 'กรุณาเลือกรอบที่ต้องการย้าย'
    if (!transferYear) return 'กรุณาเลือกปีที่ต้องการย้าย'
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
    if (phone.trim() && !/^[0-9+\-\s]{6,20}$/.test(phone.trim()))
      return 'กรุณากรอกเบอร์โทรให้ถูกต้อง'
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
    setStep((s) => (s === 1 ? -1 : s > -1 ? ((s - 1) as Step) : s))
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
        transferYear: transferYear ? Number(transferYear) : null,
        facebookUrl: null,
        phone: phone.trim() || null,
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

  if (step === -1) return <OnboardingWelcome onContinue={() => setStep(1)} />

  return (
    <div className="flex w-full flex-col gap-5 max-w-lg mx-auto p-4 pb-24">
      <div className="fixed inset-x-0 top-0 z-20 bg-background">
        <div className="mx-auto flex max-w-lg flex-col gap-4 px-4 pb-3 pt-6">
          <h1 className="py-2 text-xl font-bold">เริ่มใช้งาน</h1>
          <StepProgress
            steps={[STEP_TITLES[1], STEP_TITLES[2], STEP_TITLES[3]]}
            currentStep={step}
          />
        </div>
      </div>
      {/* Spacer matching the fixed header's rendered height above, so
          content doesn't start underneath it. */}
      <div className="h-[136px]" />

      {step === 1 && (
        <OriginFields
          position={position}
          onPositionChange={handlePositionChange}
          serviceType={serviceType}
          onServiceTypeChange={handleServiceTypeChange}
          originProvince={originProvince}
          onOriginProvinceChange={handleOriginProvinceChange}
          originDistrict={originDistrict}
          onOriginDistrictChange={handleOriginDistrictChange}
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
          benefitNote={benefitNote}
          onBenefitNoteChange={setBenefitNote}
        />
      )}

      {step === 2 && (
        <>
          <TransferFields
            transferRound={transferRound}
            onTransferRoundChange={setTransferRound}
            transferYear={transferYear}
            onTransferYearChange={setTransferYear}
            transferYearOptions={transferYearOptions}
          />
          <DestinationFields
            serviceType={serviceType}
            destinations={destinations}
            onUpdateDestination={updateDestination}
            onAddDestination={addDestination}
            onRemoveDestination={removeDestination}
            maxDestinations={FREE_DESTINATION_LIMIT}
            showUpgradeLink={false}
          />
        </>
      )}

      {step === 3 && (
        <>
          <SectionHeader
            icon={<IdCardIcon />}
            title="ข้อมูลติดต่อ"
            subtitle="เราจะไม่แสดงข้อมูลติดต่อนี้จนกว่าคุณจะอนุญาตให้เข้าถึง"
          />

          <label className="flex flex-col gap-1">
            <span className="text-[14px] font-semibold">ชื่อ*</span>
            <input
              className="input-field"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </label>

          <div className="flex flex-col gap-1">
            <label className="flex flex-col gap-1">
              <span className="text-[14px] font-semibold">นามสกุล*</span>
              <input
                className="input-field"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </label>
            <p className="text-xs text-zinc-500">
              ชื่อ-นามสกุลของคุณจะถูกเก็บเป็นความลับและไม่แสดงต่อผู้อื่น
            </p>
          </div>

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

          <label className="flex items-center gap-2 text-xs cursor-pointer w-fit">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={lineConsent}
              onChange={(e) => setLineConsent(e.target.checked)}
            />
            <span className="flex items-center justify-center size-[18px] rounded shrink-0 border border-zinc-300 bg-white text-transparent peer-checked:bg-brand-red peer-checked:border-brand-red peer-checked:text-white text-[12px]">
              ✓
            </span>
            <span>ยืนยันรับข่าวสารและข้อมูลเพิ่มเติมผ่าน LINE</span>
          </label>

          <label className="flex items-center gap-2 text-xs cursor-pointer w-fit">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            <span className="flex items-center justify-center size-[18px] rounded shrink-0 border border-zinc-300 bg-white text-transparent peer-checked:bg-brand-red peer-checked:border-brand-red peer-checked:text-white text-[12px]">
              ✓
            </span>
            <span>
              <Link href="/terms" target="_blank" className="underline">
                ฉันยอมรับข้อกำหนดการใช้งาน
              </Link>
              และ
              <Link href="/terms" target="_blank" className="underline">
                นโยบายความเป็นส่วนตัว
              </Link>
            </span>
          </label>
        </>
      )}

      {error && <p className="text-terracotta text-sm">{error}</p>}

      {
        <div className="fixed inset-x-0 bottom-0 bg-background p-4">
          <div className="mx-auto flex max-w-lg justify-between gap-3">
            <button type="button" onClick={goBack} className="btn-brand-secondary flex-1">
              ย้อนกลับ
            </button>

            {step < 3 ? (
              <button type="button" onClick={goNext} className="btn-brand-primary flex-1">
                ถัดไป
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !termsAccepted}
                className="btn-brand-primary flex-1"
              >
                {saving ? 'กำลังบันทึก...' : 'ลงทะเบียน'}
              </button>
            )}
          </div>
        </div>
      }
    </div>
  )
}
