'use client'

import { useState } from 'react'
import Link from 'next/link'
import { positionLabel } from '@/lib/positions'
import { serviceTypeAbbr } from '@/lib/service-types'
import { teachingGroupLabel } from '@/lib/teaching-groups'
import { formatTransferRound } from '@/lib/transfer-rounds'
import { OriginDestinationTabs, type OriginDestinationTab } from './origin-destination-tabs'
import type { Destination, Teacher } from '@/lib/types'

interface CriteriaSummaryProps {
  teacher: Teacher
  destinations: Destination[]
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 py-3 border-b border-sage last:border-0">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  )
}

// Read-only display of everything that drives matching — the ตั้งค่า tab's
// landing content. Editing happens on the separate /criteria/edit screen.
export function CriteriaSummary({ teacher, destinations }: CriteriaSummaryProps) {
  const [tab, setTab] = useState<OriginDestinationTab>('origin')

  return (
    <div className="flex flex-col gap-5 max-w-lg mx-auto p-4">
      <h1 className="text-xl font-semibold">ตั้งค่าการค้นหา</h1>
      <p className="text-sm text-zinc-600">
        ข้อมูลปัจจุบันที่ใช้ในการจับคู่ย้ายสับเปลี่ยน เพื่อแก้ไขกรุณากดปุ่มแก้ไขด้านล่าง
      </p>

      <OriginDestinationTabs active={tab} onChange={setTab} />

      {tab === 'origin' ? (
        <div className="flex flex-col">
          <Row label="ตำแหน่ง" value={positionLabel(teacher.position)} />
          <Row label="หน่วยงานต้นสังกัด" value={serviceTypeAbbr(teacher.service_type)} />
          <Row label="จังหวัด" value={teacher.origin_province} />
          {teacher.origin_district && <Row label="อำเภอ (ไม่บังคับ)" value={teacher.origin_district} />}
          {teacher.origin_zone && <Row label="เขตพื้นที่ (ไม่บังคับ)" value={teacher.origin_zone} />}
          {teacher.current_school && <Row label="โรงเรียนปัจจุบัน" value={teacher.current_school} />}
          {teacher.teaching_group && (
            <Row
              label="กลุ่มสาระการเรียนรู้"
              value={
                teacher.subject
                  ? `${teachingGroupLabel(teacher.teaching_group)} · ${teacher.subject}`
                  : teachingGroupLabel(teacher.teaching_group)
              }
            />
          )}
          {teacher.transfer_round && (
            <Row label="รอบที่ต้องการย้าย" value={formatTransferRound(teacher.transfer_round)!} />
          )}
          {teacher.benefit_note && (
            <Row label="ข้อมูลสวัสดิการเพิ่มเติม (ไม่บังคับ)" value={teacher.benefit_note} />
          )}
        </div>
      ) : (
        <div className="flex flex-col">
          {destinations.length === 0 ? (
            <p className="text-sm text-zinc-500 py-3">ยังไม่ได้เพิ่มปลายทาง</p>
          ) : (
            destinations.map((d, i) => (
              <Row
                key={d.id}
                label={`จังหวัดปลายทาง #${i + 1}`}
                value={[d.province, d.zone, d.district].filter(Boolean).join(' ')}
              />
            ))
          )}
        </div>
      )}

      <Link href={`/criteria/edit?tab=${tab}`} className="btn-primary text-center">
        แก้ไขข้อมูล
      </Link>
    </div>
  )
}
