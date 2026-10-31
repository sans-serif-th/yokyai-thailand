// "ขอเพิ่มตำแหน่งในระบบ": the form for users whose position is missing from the
// registration dropdown. Pure validation shared by the form and the API route.

export const POSITION_NAME_MAX = 100
export const CRITERIA_MAX = 2000

export const THAI_MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
]

// When the new position's next transfer is due, picked by the user as a month
// and a พ.ศ. year. It is the position's own schedule, not one of the system's
// transfer rounds (lib/transfer-rounds.ts). Stored as text in
// position_requests.transfer_round, e.g. "มีนาคม 2570".
export function formatScheduledTransfer(monthIndex: number, buddhistYear: number): string {
  return `${THAI_MONTHS[monthIndex]} ${buddhistYear}`
}

const SCHEDULED_TRANSFER_PATTERN = new RegExp(`^(${THAI_MONTHS.join('|')}) 25\\d{2}$`)

// The current พ.ศ. year and the next two: "ใกล้จะถึง" never reaches further.
export function scheduleYearOptions(now: Date = new Date()): number[] {
  const year = now.getFullYear() + 543
  return [year, year + 1, year + 2]
}

export interface PositionRequestInput {
  positionName: string
  transferRound: string
  criteria: string
  contactConsent: boolean
}

// Returns an error message, or null when valid. Trims nothing: callers pass the
// trimmed values from normalizePositionRequest.
export function validatePositionRequest(input: PositionRequestInput): string | null {
  if (!input.positionName) return 'กรุณาระบุชื่อตำแหน่ง'
  if (input.positionName.length > POSITION_NAME_MAX) return `ชื่อตำแหน่งยาวเกิน ${POSITION_NAME_MAX} ตัวอักษร`
  if (input.transferRound && !SCHEDULED_TRANSFER_PATTERN.test(input.transferRound)) return 'กำหนดการย้ายไม่ถูกต้อง'
  if (!input.criteria) return 'กรุณาระบุเกณฑ์การย้าย'
  if (input.criteria.length > CRITERIA_MAX) return `เกณฑ์การย้ายยาวเกิน ${CRITERIA_MAX} ตัวอักษร`
  return null
}

// Coerces an untrusted JSON body into the typed shape (strings trimmed, junk
// types become empty, consent only true when it is literally true).
export function normalizePositionRequest(body: unknown): PositionRequestInput {
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>
  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
  return {
    positionName: str(b.positionName),
    transferRound: str(b.transferRound),
    criteria: str(b.criteria),
    contactConsent: b.contactConsent === true,
  }
}
