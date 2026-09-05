import Link from 'next/link'
import { positionLabel } from '@/lib/positions'
import { serviceTypeAbbr } from '@/lib/service-types'
import { teachingGroupLabel } from '@/lib/teaching-groups'
import type { Destination, Teacher } from '@/lib/types'

interface CriteriaSummaryProps {
  teacher: Teacher
  destinations: Destination[]
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  )
}

// Read-only display of everything that drives matching — the ตั้งค่า tab's
// landing content. Editing happens on the separate /criteria/edit screen.
export function CriteriaSummary({ teacher, destinations }: CriteriaSummaryProps) {
  const origin = [teacher.origin_province, teacher.origin_zone, teacher.origin_district]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="flex flex-col gap-5 max-w-lg mx-auto p-4">
      <h1 className="text-xl font-semibold">ตั้งค่า</h1>
      <p className="text-sm text-zinc-600">ข้อมูลที่ใช้ในการจับคู่ของคุณ</p>

      <div className="card-surface flex flex-col gap-4">
        <Row label="ตำแหน่ง" value={positionLabel(teacher.position)} />
        <Row label="หน่วยงานต้นสังกัด" value={serviceTypeAbbr(teacher.service_type)} />
        <Row label="ต้นทาง" value={origin} />
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
        {teacher.transfer_round && <Row label="รอบที่ต้องการย้าย" value={`ปี ${teacher.transfer_round}`} />}
        {teacher.benefit_note && <Row label="ข้อมูลสวัสดิการ" value={teacher.benefit_note} />}
        <Row
          label="ปลายทาง"
          value={
            destinations
              .map((d) => [d.province, d.zone, d.district].filter(Boolean).join(' '))
              .join(', ') || 'ยังไม่ได้เพิ่มปลายทาง'
          }
        />
      </div>

      <Link href="/criteria/edit" className="btn-primary text-center">
        แก้ไข
      </Link>
    </div>
  )
}
