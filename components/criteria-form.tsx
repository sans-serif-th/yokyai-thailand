'use client'

import { useState } from 'react'
import { requiresTeachingGroup, type PositionCode } from '@/lib/positions'
import type { ServiceTypeCode } from '@/lib/service-types'
import { upcomingTransferYears } from '@/lib/transfer-rounds'
import { BackHeader } from './back-header'
import { OriginFields, splitSubjects, joinSubjects } from './origin-fields'
import { DestinationFields, findDuplicateProvince, type DestinationDraft } from './destination-fields'
import { OriginDestinationTabs, type OriginDestinationTab } from './origin-destination-tabs'
import type { Destination, ProfilePayload, Teacher } from '@/lib/types'

interface CriteriaFormProps {
  teacher: Teacher
  initialDestinations: Destination[]
  maxDestinations: number
  initialTab?: OriginDestinationTab
  onSave: (payload: ProfilePayload) => Promise<void>
}

// The ตั้งค่า (search criteria) page: everything that actually drives
// matching — position, service type, origin, teaching group/subject,
// destinations. Contact name lives on the separate โปรไฟล์ page, but PUT
// /api/teachers replaces the whole profile, so it's passed through
// unchanged here.
export function CriteriaForm({
  teacher,
  initialDestinations,
  maxDestinations,
  initialTab,
  onSave,
}: CriteriaFormProps) {
  const [position, setPosition] = useState<PositionCode | ''>(teacher.position)
  const [serviceType, setServiceType] = useState<ServiceTypeCode | ''>(teacher.service_type)
  const [originProvince, setOriginProvince] = useState(teacher.origin_province)
  const [originDistrict, setOriginDistrict] = useState(teacher.origin_district ?? '')
  const [originZone, setOriginZone] = useState(teacher.origin_zone ?? '')
  const [currentSchool, setCurrentSchool] = useState(teacher.current_school ?? '')
  const [teachingGroup, setTeachingGroup] = useState(teacher.teaching_group ?? '')
  const [subjects, setSubjects] = useState<string[]>(() => splitSubjects(teacher.subject))
  const [transferRound, setTransferRound] = useState(teacher.transfer_round ?? '')
  const [transferYear, setTransferYear] = useState(
    teacher.transfer_year ? String(teacher.transfer_year) : ''
  )
  const [benefitNote, setBenefitNote] = useState(teacher.benefit_note ?? '')
  const [transferYearOptions] = useState(() => upcomingTransferYears())

  const [destinations, setDestinations] = useState<DestinationDraft[]>(
    initialDestinations.length
      ? initialDestinations.map((d) => ({
          province: d.province,
          district: d.district ?? '',
          zone: d.zone ?? '',
        }))
      : [{ province: '', district: '', zone: '' }]
  )

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<OriginDestinationTab>(initialTab ?? 'origin')

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
    setServiceType(value as ServiceTypeCode | '')
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
          return { province: value, district: '', zone: '' }
        }
        return { ...d, [field]: value }
      })
    )
  }

  function addDestination() {
    setDestinations((prev) =>
      prev.length >= maxDestinations ? prev : [...prev, { province: '', district: '', zone: '' }]
    )
  }

  function removeDestination(index: number) {
    setDestinations((prev) => prev.filter((_, i) => i !== index))
  }

  function validate(): string | null {
    if (!position) return 'กรุณาเลือกตำแหน่ง'
    if (!serviceType) return 'กรุณาเลือกหน่วยงานต้นสังกัด'
    if (!originProvince) return 'กรุณาเลือกจังหวัดต้นทาง'
    if (requiresTeachingGroup(position) && !teachingGroup) return 'กรุณาเลือกกลุ่มสาระการเรียนรู้'
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

  async function handleSave() {
    const validationError = validate()
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
        displayName: teacher.display_name,
        facebookUrl: teacher.facebook_url,
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
      <BackHeader title="แก้ไขการตั้งค่า" href="/criteria" />

      <OriginDestinationTabs active={tab} onChange={setTab} />

      {tab === 'origin' ? (
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
          transferYear={transferYear}
          onTransferYearChange={setTransferYear}
          transferYearOptions={transferYearOptions}
          benefitNote={benefitNote}
          onBenefitNoteChange={setBenefitNote}
        />
      ) : (
        <DestinationFields
          serviceType={serviceType}
          destinations={destinations}
          onUpdateDestination={updateDestination}
          onAddDestination={addDestination}
          onRemoveDestination={removeDestination}
          maxDestinations={maxDestinations}
        />
      )}

      {error && <p className="text-terracotta text-sm">{error}</p>}

      <button type="button" onClick={handleSave} disabled={saving} className="btn-primary">
        {saving ? 'กำลังบันทึก...' : 'บันทึก'}
      </button>
      <p className="text-xs text-zinc-500 text-center">หลังบันทึก ระบบจะรีเฟรชผลการจับคู่ให้ทันที</p>
    </div>
  )
}
