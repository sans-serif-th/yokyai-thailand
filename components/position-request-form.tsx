'use client'

import { useState } from 'react'
import { submitPositionRequest } from '@/lib/api'
import { CRITERIA_MAX, POSITION_NAME_MAX, validatePositionRequest } from '@/lib/position-request'
import { withAuthRetry } from '@/lib/session'
import { transferRoundYearOptions, upcomingTransferYears } from '@/lib/transfer-rounds'
import { UserIcon } from './icons'
import { SectionHeader } from './section-header'

// "ฟอร์มขอเพิ่มตำแหน่งในระบบ" (Figma 204:2073 / 204:2156): reached from the
// registration form's ตำแหน่ง dropdown when the user's position is missing.
// Rendered over the wizard (not a separate route) so the half-filled
// registration form survives going back.
export function PositionRequestForm({ onBack }: { onBack: () => void }) {
  const [positionName, setPositionName] = useState('')
  const [roundValue, setRoundValue] = useState('')
  const [criteria, setCriteria] = useState('')
  const [contactConsent, setContactConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [roundOptions] = useState(() => transferRoundYearOptions(upcomingTransferYears()))

  async function submit() {
    const payload = {
      positionName: positionName.trim(),
      transferRound: roundOptions.find((o) => o.value === roundValue)?.label ?? '',
      criteria: criteria.trim(),
      contactConsent,
    }
    const invalid = validatePositionRequest(payload)
    if (invalid) {
      setError(invalid)
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await withAuthRetry((token) => submitPositionRequest(token, payload))
      setDone(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-5 px-4 py-6">
      <h1 className="py-2 text-xl font-bold">ฟอร์มขอเพิ่มตำแหน่งในระบบ</h1>

      <div className="flex flex-col gap-4">
        <SectionHeader
          icon={<UserIcon />}
          title="ข้อมูลตำแหน่งงาน"
          subtitle="ร่วมเสนอตำแหน่งที่คุณต้องการให้มีในระบบโยกย้าย"
        />

        <label className="flex flex-col gap-1">
          <span className="text-[14px] font-semibold">ชื่อตำแหน่ง *</span>
          <input
            className="input-field"
            placeholder="ระบุ..."
            maxLength={POSITION_NAME_MAX}
            value={positionName}
            onChange={(e) => setPositionName(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[14px] font-semibold">รอบการย้าย</span>
          <select className="input-field" value={roundValue} onChange={(e) => setRoundValue(e.target.value)}>
            <option value="">เลือกรอบ / ปี</option>
            {roundOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[14px] font-semibold">เกณฑ์การย้าย*</span>
          <textarea
            className="textarea-field"
            placeholder="ช่วยอธิบายเกณฑ์การย้ายคร่าวๆ เพื่อให้ทีมพัฒนาสามารถพัฒนาระบบให้สอดคล้องกับความต้องการของท่าน..."
            maxLength={CRITERIA_MAX}
            value={criteria}
            onChange={(e) => setCriteria(e.target.value)}
          />
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <p className="py-2 text-base font-semibold">การติดต่อกลับ</p>
        <label className="flex cursor-pointer items-start gap-[15px] text-xs leading-[18px]">
          <input
            type="checkbox"
            className="peer sr-only"
            checked={contactConsent}
            onChange={(e) => setContactConsent(e.target.checked)}
          />
          <span className="flex size-[18px] shrink-0 items-center justify-center rounded border border-[#a6a6a6] bg-white text-[12px] text-transparent peer-checked:border-brand-red peer-checked:bg-brand-red peer-checked:text-white">
            ✓
          </span>
          <span>ยินยอมให้ทีมงานติดต่อกลับเพื่อสอบถามข้อมูลเพิ่มเติมเกี่ยวกับตำแหน่งที่เสนอ</span>
        </label>
      </div>

      <div className="mt-auto flex flex-col gap-3">
        {error && <p className="text-sm text-terracotta">{error}</p>}
        <div className="flex gap-4">
          <button type="button" onClick={onBack} disabled={submitting} className="btn-brand-secondary flex-1">
            ย้อนกลับ
          </button>
          <button type="button" onClick={submit} disabled={submitting} className="btn-brand-primary flex-1">
            {submitting ? 'กำลังส่ง...' : 'ส่งฟอร์ม'}
          </button>
        </div>
      </div>

      {done && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-[rgba(23,23,23,0.5)] p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="position-request-thanks"
        >
          <div className="flex w-full max-w-[358px] flex-col gap-5 rounded-[32px] bg-background px-4 py-6">
            <div className="flex flex-col py-2 text-center">
              <p id="position-request-thanks" className="text-base font-semibold leading-6">
                ขอบคุณสำหรับข้อมูล
              </p>
              <p className="text-xs leading-[18px]">
                ทีมได้รับข้อเสนอเพิ่มตำแหน่งของท่านเรียบร้อยแล้ว ทีมงานจะนำข้อมูลไปพิจารณาเพื่อรองรับการใช้งานในอนาคต
                <br />
                <br />
                ขอบคุณที่สนใจใช้บริการแอปโยกย้าย
                <br />
                หากมีการอัพเดทตำแหน่งใหม่ จะมีการแจ้งไปทาง LINE OA โยกย้าย
              </p>
            </div>
            <button type="button" onClick={onBack} className="btn-brand-secondary w-full">
              ตกลง
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
