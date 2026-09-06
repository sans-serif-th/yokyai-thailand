'use client'

import { TEACHING_GROUPS } from '@/lib/teaching-groups'
import { THAI_PROVINCES } from '@/lib/provinces'
import { SERVICE_TYPES, type ServiceTypeCode } from '@/lib/service-types'
import { POSITIONS, requiresTeachingGroup, type PositionCode } from '@/lib/positions'
import { districtsForProvince } from '@/lib/districts'
import { hasZoneOptions, zonesFor } from '@/lib/education-zones'
import { TRANSFER_ROUND_OPTIONS } from '@/lib/transfer-rounds'

export const BENEFIT_NOTE_MAX_LENGTH = 500

// วิชาเอก is stored as a single comma-separated column, but edited as one
// input per subject (teachers commonly hold more than one เอก).
export function splitSubjects(subject: string | null): string[] {
  if (!subject) return ['']
  return subject.split(',').map((s) => s.trim())
}

export function joinSubjects(subjects: string[]): string | null {
  const trimmed = subjects.map((s) => s.trim()).filter(Boolean)
  return trimmed.length ? trimmed.join(', ') : null
}

interface OriginFieldsProps {
  position: PositionCode | ''
  onPositionChange: (value: string) => void
  serviceType: ServiceTypeCode | ''
  onServiceTypeChange: (value: string) => void
  originProvince: string
  onOriginProvinceChange: (value: string) => void
  originDistrict: string
  onOriginDistrictChange: (value: string) => void
  originZone: string
  onOriginZoneChange: (value: string) => void
  currentSchool: string
  onCurrentSchoolChange: (value: string) => void
  teachingGroup: string
  onTeachingGroupChange: (value: string) => void
  subjects: string[]
  onUpdateSubject: (index: number, value: string) => void
  onAddSubject: () => void
  onRemoveSubject: (index: number) => void
  transferRound: string
  onTransferRoundChange: (value: string) => void
  transferYear: string
  onTransferYearChange: (value: string) => void
  transferYearOptions: number[]
  benefitNote: string
  onBenefitNoteChange: (value: string) => void
}

// Shared by the onboarding wizard's ข้อมูลต้นทาง step and the standalone
// ตั้งค่า (search criteria) page — both edit the same matching-relevant
// fields, just inside different chrome.
export function OriginFields({
  position,
  onPositionChange,
  serviceType,
  onServiceTypeChange,
  originProvince,
  onOriginProvinceChange,
  originDistrict,
  onOriginDistrictChange,
  originZone,
  onOriginZoneChange,
  currentSchool,
  onCurrentSchoolChange,
  teachingGroup,
  onTeachingGroupChange,
  subjects,
  onUpdateSubject,
  onAddSubject,
  onRemoveSubject,
  transferRound,
  onTransferRoundChange,
  transferYear,
  onTransferYearChange,
  transferYearOptions,
  benefitNote,
  onBenefitNoteChange,
}: OriginFieldsProps) {
  return (
    <>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">ตำแหน่ง</span>
        <select
          className="input-field"
          value={position}
          onChange={(e) => onPositionChange(e.target.value)}
        >
          <option value="">เลือกตำแหน่ง</option>
          {POSITIONS.map((p) => (
            <option key={p.code} value={p.code}>
              {p.nameTh}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">หน่วยงานต้นสังกัด</span>
        <select
          className="input-field"
          value={serviceType}
          onChange={(e) => onServiceTypeChange(e.target.value)}
        >
          <option value="">เลือกหน่วยงาน</option>
          {SERVICE_TYPES.map((s) => (
            <option key={s.code} value={s.code}>
              {s.abbrTh} — {s.nameTh}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-3 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">ต้นทาง — จังหวัด</span>
          <select
            className="input-field"
            value={originProvince}
            onChange={(e) => onOriginProvinceChange(e.target.value)}
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
          <span className="text-sm font-medium">อำเภอ (ไม่บังคับ)</span>
          <select
            className="input-field"
            value={originDistrict}
            onChange={(e) => onOriginDistrictChange(e.target.value)}
            disabled={!originProvince}
          >
            <option value="">{originProvince ? 'เลือกอำเภอ' : 'เลือกจังหวัดก่อน'}</option>
            {districtsForProvince(originProvince).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">เขตพื้นที่ (ไม่บังคับ)</span>
          <select
            className="input-field"
            value={originZone}
            onChange={(e) => onOriginZoneChange(e.target.value)}
            disabled={!serviceType || !hasZoneOptions(serviceType) || !originProvince}
          >
            <option value="">
              {!serviceType || !hasZoneOptions(serviceType)
                ? 'ไม่มีเขตย่อย'
                : originProvince
                  ? 'เลือกเขตพื้นที่'
                  : 'เลือกจังหวัดก่อน'}
            </option>
            {zonesFor(serviceType, originProvince).map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">โรงเรียนปัจจุบัน (ไม่บังคับ)</span>
        <input
          className="input-field"
          value={currentSchool}
          onChange={(e) => onCurrentSchoolChange(e.target.value)}
        />
      </label>

      {requiresTeachingGroup(position) && (
        <>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">กลุ่มสาระการเรียนรู้</span>
            <select
              className="input-field"
              value={teachingGroup}
              onChange={(e) => onTeachingGroupChange(e.target.value)}
            >
              <option value="">เลือกกลุ่มสาระ</option>
              {TEACHING_GROUPS.map((g) => (
                <option key={g.code} value={g.code}>
                  {g.nameTh}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">วิชาเอก (ไม่บังคับ — ใช้สำหรับกรองผลลัพธ์)</span>
            {subjects.map((s, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className="input-field flex-1"
                  value={s}
                  onChange={(e) => onUpdateSubject(i, e.target.value)}
                  placeholder="เช่น คณิตศาสตร์"
                />
                {subjects.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveSubject(i)}
                    className="text-terracotta px-2"
                    aria-label="ลบวิชาเอกนี้"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={onAddSubject} className="self-start text-sm link-accent">
              + เพิ่มวิชาเอก
            </button>
          </div>
        </>
      )}

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">รอบที่ต้องการย้าย</span>
          <select
            className="input-field"
            value={transferRound}
            onChange={(e) => onTransferRoundChange(e.target.value)}
          >
            <option value="">เลือกรอบ</option>
            {TRANSFER_ROUND_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">ปีที่ต้องการย้าย</span>
          <select
            className="input-field"
            value={transferYear}
            onChange={(e) => onTransferYearChange(e.target.value)}
          >
            <option value="">เลือกปี</option>
            {transferYearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">ข้อมูลสวัสดิการเพิ่มเติม (ไม่บังคับ)</span>
        <textarea
          className="textarea-field"
          rows={4}
          maxLength={BENEFIT_NOTE_MAX_LENGTH}
          value={benefitNote}
          onChange={(e) => onBenefitNoteChange(e.target.value)}
          placeholder="เช่น มีบ้านพักครู"
        />
        <span className="text-xs text-zinc-500 self-end">
          {benefitNote.length}/{BENEFIT_NOTE_MAX_LENGTH}
        </span>
      </label>
    </>
  )
}
