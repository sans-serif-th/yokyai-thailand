// The 3 service types relevant to teacher transfers (ย้ายสับเปลี่ยน).
// A teacher can only swap with someone in the same service type — the
// hiring/administrative systems differ, so cross-type moves aren't real
// mutual transfers. Must stay in sync with supabase/schema.sql's seed data.

export type ServiceTypeCode = 'primary' | 'secondary' | 'vocational'

export interface ServiceType {
  code: ServiceTypeCode
  nameTh: string
  abbrTh: string
}

export const SERVICE_TYPES: ServiceType[] = [
  { code: 'primary', nameTh: 'สำนักงานเขตพื้นที่การศึกษาประถมศึกษา', abbrTh: 'สพป.' },
  { code: 'secondary', nameTh: 'สำนักงานเขตพื้นที่การศึกษามัธยมศึกษา', abbrTh: 'สพม.' },
  { code: 'vocational', nameTh: 'สำนักงานคณะกรรมการการอาชีวศึกษา', abbrTh: 'สอศ.' },
]

export function serviceTypeAbbr(code: string): string {
  return SERVICE_TYPES.find((s) => s.code === code)?.abbrTh ?? code
}
