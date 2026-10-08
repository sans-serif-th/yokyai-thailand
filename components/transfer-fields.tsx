'use client'

import { parseTransferRoundYear, transferRoundYearOptions } from '@/lib/transfer-rounds'
import { SectionHeader } from './section-header'
import { RouteIcon } from './icons'

interface TransferFieldsProps {
  transferRound: string
  onTransferRoundChange: (value: string) => void
  transferYear: string
  onTransferYearChange: (value: string) => void
  transferYearOptions: number[]
}

// "ข้อมูลการย้าย" — which transfer round/year the teacher is registering
// for. Sits above the destination cards on both the wizard's ปลายทาง step
// and the ตั้งค่า page's ปลายทาง tab (it was part of the origin fields
// before the 2026-10 Figma update).
export function TransferFields({
  transferRound,
  onTransferRoundChange,
  transferYear,
  onTransferYearChange,
  transferYearOptions,
}: TransferFieldsProps) {
  return (
    <div className="flex flex-col gap-4">
      <SectionHeader icon={<RouteIcon />} title="ข้อมูลการย้าย" subtitle="ข้อมูลที่เกี่ยวข้องกับความต้องการย้าย" />
      <label className="flex flex-col gap-1">
        <span className="text-[14px] font-semibold">รอบที่ต้องการย้าย*</span>
        <select
          className="input-field"
          value={transferRound && transferYear ? `${transferRound}-${transferYear}` : ''}
          onChange={(e) => {
            const { round, year } = parseTransferRoundYear(e.target.value)
            onTransferRoundChange(round)
            onTransferYearChange(year)
          }}
        >
          <option value="">เลือกรอบที่ต้องการย้าย</option>
          {transferRoundYearOptions(transferYearOptions).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
