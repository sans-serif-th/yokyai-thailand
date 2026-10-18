import { LINE_ID_PATTERN, PHONE_PATTERN } from '../field-constants'
import type { FieldDef } from './fields'

// The example role: an imaginary profession used to prove that a second role
// needs only a field list, a matcher and a table. Not offered to real users —
// it is registered only when NEXT_PUBLIC_DEV_TOOLS=1 (see lib/roles/index.ts).
export const DEMO_ROLE_CODE = 'demo'
export const DEMO_TABLE = 'demo_profiles'
export const DEMO_ROLE_ENABLED = process.env.NEXT_PUBLIC_DEV_TOOLS === '1'

export const DEMO_SPECIALTIES = ['general', 'icu', 'er'] as const

export const DEMO_FIELDS: readonly FieldDef[] = [
  { key: 'displayName', column: 'display_name', label: 'Name', type: 'text', required: true, adminEditable: true },
  {
    key: 'originProvince',
    column: 'origin_province',
    label: 'Origin Province',
    type: 'text',
    required: true,
    public: true,
    adminEditable: true,
  },
  { key: 'phone', column: 'phone', label: 'Phone', type: 'text', pattern: PHONE_PATTERN, trim: true, adminEditable: true },
  { key: 'lineId', column: 'line_id', label: 'LINE ID', type: 'text', pattern: LINE_ID_PATTERN, trim: true, adminEditable: true },
  {
    key: 'specialty',
    column: 'specialty',
    table: DEMO_TABLE,
    label: 'แผนก',
    type: 'select',
    required: true,
    options: DEMO_SPECIALTIES,
    optionLabels: { general: 'ทั่วไป', icu: 'ผู้ป่วยหนัก (ICU)', er: 'ฉุกเฉิน (ER)' },
    public: true,
    card: true,
  },
  {
    key: 'yearsExperience',
    column: 'years_experience',
    table: DEMO_TABLE,
    label: 'ประสบการณ์ (ปี)',
    type: 'number',
    min: 0,
    max: 60,
    suffix: 'ปี',
    public: true,
    card: true,
  },
  {
    key: 'workplace',
    column: 'workplace',
    table: DEMO_TABLE,
    label: 'สถานที่ทำงาน',
    type: 'text',
    maxLength: 100,
    public: true,
    card: true,
  },
]
