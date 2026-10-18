'use client'

import { useState } from 'react'
import { getRoleFields } from '@/lib/roles/field-registry'
import { validateFieldValue, type FieldDef } from '@/lib/roles/fields'
import { THAI_PROVINCES } from '@/lib/provinces'
import { FREE_DESTINATION_LIMIT } from '@/lib/package-limits'
import { DestinationFields, findDuplicateProvince, type DestinationDraft } from './destination-fields'
import { SectionHeader } from './section-header'
import { IdCardIcon } from './icons'
import type { Destination, ProfilePayload, Teacher } from '@/lib/types'

interface DynamicProfileFormProps {
  // Role whose fields the form renders (lib/roles/field-registry).
  category: string
  initialTeacher: Teacher | null
  initialDestinations: Destination[]
  onSave: (payload: ProfilePayload) => Promise<void>
  maxDestinations?: number
  showUpgradeLink?: boolean
  onBack?: () => void
}

// The initial text of a field: the extension-table value from `profile`, or the
// `teachers` column.
function initialValue(field: FieldDef, teacher: Teacher | null): string {
  if (!teacher) return ''
  const v = field.table
    ? teacher.profile?.[field.key]
    : (teacher as unknown as Record<string, unknown>)[field.column]
  return v === null || v === undefined ? '' : String(v)
}

// Registration / edit form for roles without a hand-written form: every input
// comes from the role's FieldDef list, so a new field needs no change here.
export function DynamicProfileForm({
  category,
  initialTeacher,
  initialDestinations,
  onSave,
  maxDestinations = FREE_DESTINATION_LIMIT,
  showUpgradeLink = false,
  onBack,
}: DynamicProfileFormProps) {
  const fields = getRoleFields(category)
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.key, initialValue(f, initialTeacher)]))
  )
  const [destinations, setDestinations] = useState<DestinationDraft[]>(() =>
    initialDestinations.length
      ? initialDestinations.map((d) => ({ province: d.province, district: d.district ?? '', zone: d.zone ?? '' }))
      : [{ province: '', district: '', zone: '' }]
  )
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const set = (key: string, v: string) => setValues((prev) => ({ ...prev, [key]: v }))

  function typed(f: FieldDef): unknown {
    const v = values[f.key]?.trim() ?? ''
    if (v === '') return null
    return f.type === 'number' ? Number(v) : v
  }

  async function handleSave() {
    for (const f of fields) {
      if (!validateFieldValue(f, typed(f))) {
        setError(`กรุณากรอก ${f.label} ให้ถูกต้อง`)
        return
      }
    }
    const valid = destinations.filter((d) => d.province.trim())
    if (valid.length === 0) return setError('กรุณาเลือกปลายทางอย่างน้อย 1 แห่ง')
    const dup = findDuplicateProvince(valid)
    if (dup) return setError(`เลือกจังหวัด ${dup} ซ้ำกัน`)

    const payload: Record<string, unknown> = { category, profile: {} }
    for (const f of fields) {
      if (f.table) (payload.profile as Record<string, unknown>)[f.key] = typed(f)
      else payload[f.key] = typed(f)
    }
    payload.destinations = valid.map((d) => ({
      province: d.province,
      district: d.district.trim() || null,
      zone: d.zone.trim() || null,
    }))

    setError(null)
    setSaving(true)
    try {
      await onSave(payload as unknown as ProfilePayload)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  function renderField(f: FieldDef) {
    const required = f.required ? '*' : ''
    return (
      <label key={f.key} className="flex flex-col gap-1">
        <span className="text-[14px] font-semibold">
          {f.label}
          {required}
        </span>
        {f.key === 'originProvince' ? (
          <select className="input-field" value={values[f.key]} onChange={(e) => set(f.key, e.target.value)}>
            <option value="">เลือกจังหวัด</option>
            {THAI_PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        ) : f.type === 'select' ? (
          <select className="input-field" value={values[f.key]} onChange={(e) => set(f.key, e.target.value)}>
            <option value="">เลือก</option>
            {f.options?.map((o) => (
              <option key={o} value={o}>
                {f.optionLabels?.[o] ?? o}
              </option>
            ))}
          </select>
        ) : (
          <input
            className="input-field"
            type={f.type === 'number' ? 'number' : 'text'}
            value={values[f.key]}
            onChange={(e) => set(f.key, e.target.value)}
          />
        )}
      </label>
    )
  }

  const contactKeys = new Set(['displayName', 'phone', 'lineId'])

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-5 p-4 pb-24">
      <h1 className="py-2 text-xl font-bold">{initialTeacher ? 'ข้อมูลของคุณ' : 'เริ่มใช้งาน'}</h1>
      {fields.filter((f) => !contactKeys.has(f.key)).map(renderField)}
      <DestinationFields
        serviceType=""
        destinations={destinations}
        onUpdateDestination={(i, field, value) =>
          setDestinations((prev) => prev.map((d, idx) => (idx === i ? { ...d, [field]: value } : d)))
        }
        onAddDestination={() => setDestinations((prev) => [...prev, { province: '', district: '', zone: '' }])}
        onRemoveDestination={(i) => setDestinations((prev) => prev.filter((_, idx) => idx !== i))}
        maxDestinations={maxDestinations}
        showUpgradeLink={showUpgradeLink}
      />
      <SectionHeader icon={<IdCardIcon />} title="ข้อมูลติดต่อ" subtitle="เราจะไม่แสดงข้อมูลติดต่อนี้จนกว่าคุณจะอนุญาตให้เข้าถึง" />
      {fields.filter((f) => contactKeys.has(f.key)).map(renderField)}
      {error && <p className="text-sm text-terracotta">{error}</p>}
      <div className="flex gap-2">
        {onBack && (
          <button type="button" onClick={onBack} className="flex-1 rounded-lg bg-zinc-200 py-3 font-medium">
            ย้อนกลับ
          </button>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex-1 rounded-lg bg-brand-red py-3 font-medium text-white disabled:opacity-50"
        >
          {saving ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
      </div>
    </div>
  )
}
