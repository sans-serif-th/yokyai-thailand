// The position (ตำแหน่ง) an applicant holds. MVP covers 2: teaching staff and
// general administrative staff — both are school-based civil-service roles
// eligible for mutual transfer, but only teaching staff have a Teaching
// Group / Subject. Must stay in sync with supabase/schema.sql's seed data.

export type PositionCode = 'teacher' | 'general_admin'

export interface Position {
  code: PositionCode
  nameTh: string
}

export const POSITIONS: Position[] = [
  { code: 'teacher', nameTh: 'ครูผู้สอน' },
  { code: 'general_admin', nameTh: 'นักจัดการงานทั่วไป' },
]

export function positionLabel(code: string): string {
  return POSITIONS.find((p) => p.code === code)?.nameTh ?? code
}

// Only teaching staff have a Teaching Group / Subject — general
// administrative staff skip those fields entirely.
export function requiresTeachingGroup(code: string): boolean {
  return code === 'teacher'
}
