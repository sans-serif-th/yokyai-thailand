'use client'

import Link from 'next/link'
import { THAI_PROVINCES } from '@/lib/provinces'
import type { ServiceTypeCode } from '@/lib/service-types'
import { districtsForProvince } from '@/lib/districts'
import { hasZoneOptions, zonesFor } from '@/lib/education-zones'

export interface DestinationDraft {
  province: string
  district: string
  zone: string
}

// Each teacher can have only one destination row per province (DB unique
// constraint on teacher_id+province), so catch duplicates before save
// rather than surfacing the raw constraint violation to the user.
export function findDuplicateProvince(destinations: DestinationDraft[]): string | null {
  const seen = new Set<string>()
  for (const d of destinations) {
    const province = d.province.trim()
    if (!province) continue
    if (seen.has(province)) return province
    seen.add(province)
  }
  return null
}

interface DestinationFieldsProps {
  serviceType: ServiceTypeCode | ''
  destinations: DestinationDraft[]
  onUpdateDestination: (index: number, field: keyof DestinationDraft, value: string) => void
  onAddDestination: () => void
  onRemoveDestination: (index: number) => void
  maxDestinations: number
  // The /upgrade link needs an existing profile to check status against —
  // suppress it during onboarding, where hitting the limit would otherwise
  // bounce a mid-wizard user back to "/" and lose their unsaved progress.
  showUpgradeLink?: boolean
}

// Shared by the onboarding wizard's ปลายทาง step and the standalone ตั้งค่า
// (search criteria) page.
export function DestinationFields({
  serviceType,
  destinations,
  onUpdateDestination,
  onAddDestination,
  onRemoveDestination,
  maxDestinations,
  showUpgradeLink = true,
}: DestinationFieldsProps) {
  const atLimit = destinations.length >= maxDestinations
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">ปลายทาง — จังหวัดที่ต้องการย้ายไป</span>
      {destinations.map((d, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
          <select
            className="input-field"
            value={d.province}
            onChange={(e) => onUpdateDestination(i, 'province', e.target.value)}
          >
            <option value="">เลือกจังหวัด</option>
            {THAI_PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select
            className="input-field"
            value={d.district}
            onChange={(e) => onUpdateDestination(i, 'district', e.target.value)}
            disabled={!d.province}
          >
            <option value="">{d.province ? 'เลือกอำเภอ' : 'เลือกจังหวัดก่อน'}</option>
            {districtsForProvince(d.province).map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
          <select
            className="input-field"
            value={d.zone}
            onChange={(e) => onUpdateDestination(i, 'zone', e.target.value)}
            disabled={!serviceType || !hasZoneOptions(serviceType) || !d.province}
          >
            <option value="">
              {!serviceType || !hasZoneOptions(serviceType)
                ? 'ไม่มีเขตย่อย'
                : d.province
                  ? 'เลือกเขตพื้นที่'
                  : 'เลือกจังหวัดก่อน'}
            </option>
            {zonesFor(serviceType, d.province).map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => onRemoveDestination(i)}
            className="text-terracotta px-2"
            aria-label="ลบปลายทางนี้"
          >
            ✕
          </button>
        </div>
      ))}
      {atLimit ? (
        <p className="text-xs text-zinc-500">
          แพ็กเกจปัจจุบันเพิ่มปลายทางได้สูงสุด {maxDestinations} แห่ง
          {showUpgradeLink && (
            <>
              {' '}
              <Link href="/upgrade" className="link-accent">
                อัปเกรดเพื่อเพิ่มได้มากขึ้น
              </Link>
            </>
          )}
        </p>
      ) : (
        <button
          type="button"
          onClick={onAddDestination}
          className="self-start text-sm link-accent"
        >
          + เพิ่มปลายทาง
        </button>
      )}
    </div>
  )
}
