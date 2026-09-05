'use client'

import { useState } from 'react'
import { requiresTeachingGroup, type PositionCode } from '@/lib/positions'
import type { ServiceTypeCode } from '@/lib/service-types'
import { OriginFields } from './origin-fields'
import { DestinationFields, type DestinationDraft } from './destination-fields'
import type { Destination, ProfilePayload, Teacher } from '@/lib/types'

function upcomingTransferYears(): number[] {
  const currentYear = new Date().getFullYear()
  return [currentYear + 1, currentYear + 2, currentYear + 3]
}

interface CriteriaFormProps {
  teacher: Teacher
  initialDestinations: Destination[]
  onSave: (payload: ProfilePayload) => Promise<void>
}

// The ตั้งค่า (search criteria) page: everything that actually drives
// matching — position, service type, origin, teaching group/subject,
// destinations. Contact name lives on the separate โปรไฟล์ page, but PUT
// /api/teachers replaces the whole profile, so it's passed through
// unchanged here.
export function CriteriaForm({ teacher, initialDestinations, onSave }: CriteriaFormProps) {
  const [position, setPosition] = useState<PositionCode | ''>(teacher.position)
  const [serviceType, setServiceType] = useState<ServiceTypeCode | ''>(teacher.service_type)
  const [originProvince, setOriginProvince] = useState(teacher.origin_province)
  const [originDistrict, setOriginDistrict] = useState(teacher.origin_district ?? '')
  const [originZone, setOriginZone] = useState(teacher.origin_zone ?? '')
  const [currentSchool, setCurrentSchool] = useState(teacher.current_school ?? '')
  const [teachingGroup, setTeachingGroup] = useState(teacher.teaching_group ?? '')
  const [subject, setSubject] = useState(teacher.subject ?? '')
  const [transferRound, setTransferRound] = useState<number | ''>(teacher.transfer_round ?? '')
  const [benefitNote, setBenefitNote] = useState(teacher.benefit_note ?? '')
  const [transferYearOptions] = useState<number[]>(() => upcomingTransferYears())

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

  function handlePositionChange(value: string) {
    setPosition(value as PositionCode | '')
    if (!requiresTeachingGroup(value)) {
      setTeachingGroup('')
      setSubject('')
    }
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
    setDestinations((prev) => [...prev, { province: '', district: '', zone: '' }])
  }

  function removeDestination(index: number) {
    setDestinations((prev) => prev.filter((_, i) => i !== index))
  }

  function validate(): string | null {
    if (!position) return 'กรุณาเลือกตำแหน่ง'
    if (!serviceType) return 'กรุณาเลือกหน่วยงานต้นสังกัด'
    if (!originProvince) return 'กรุณาเลือกจังหวัดต้นทาง'
    if (requiresTeachingGroup(position) && !teachingGroup) return 'กรุณาเลือกกลุ่มสาระการเรียนรู้'
    if (!destinations.some((d) => d.province.trim())) {
      return 'กรุณาเพิ่มปลายทางอย่างน้อย 1 แห่ง'
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
      <h1 className="text-xl font-semibold">ตั้งค่า</h1>
      <p className="text-sm text-zinc-600">
        แก้ไขข้อมูลที่ใช้ในการจับคู่ — การบันทึกจะรีเฟรชผลการจับคู่ให้ทันที
      </p>

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

      <DestinationFields
        serviceType={serviceType}
        destinations={destinations}
        onUpdateDestination={updateDestination}
        onAddDestination={addDestination}
        onRemoveDestination={removeDestination}
      />

      {error && <p className="text-terracotta text-sm">{error}</p>}

      <button type="button" onClick={handleSave} disabled={saving} className="btn-primary">
        {saving ? 'กำลังบันทึก...' : 'บันทึก'}
      </button>
    </div>
  )
}
