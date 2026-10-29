// The position (ตำแหน่ง) an applicant holds. MVP covers 2: teaching staff and
// general administrative staff — both are school-based civil-service roles
// eligible for mutual transfer, but only teaching staff have a Teaching
// Group / Subject. Must stay in sync with supabase/schema.sql's seed data.

export type PositionCode = 'teacher' | 'general_admin'

export interface Position {
  code: PositionCode
  nameTh: string
  // false = not offered in the ตำแหน่ง dropdown any more. The position stays
  // valid (existing profiles keep it, matching and labels still work); people
  // who have none yet simply cannot pick it.
  selectable?: boolean
}

export const POSITIONS: Position[] = [
  { code: 'teacher', nameTh: 'ครูผู้สอน' },
  // Hidden from the app on 2026-10-29: only ครูผู้สอน is offered for now.
  { code: 'general_admin', nameTh: 'นักจัดการงานทั่วไป', selectable: false },
]

// The positions to list in the dropdown. A hidden position is still shown to
// someone who already holds it, so editing their profile does not blank it.
export function selectablePositions(current?: string): Position[] {
  return POSITIONS.filter((p) => p.selectable !== false || p.code === current)
}

export function positionLabel(code: string): string {
  return POSITIONS.find((p) => p.code === code)?.nameTh ?? code
}

// Only teaching staff have a Teaching Group / Subject — general
// administrative staff skip those fields entirely.
export function requiresTeachingGroup(code: string): boolean {
  return code === 'teacher'
}
