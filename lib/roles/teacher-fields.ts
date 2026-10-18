import { POSITIONS } from '../positions'
import { SERVICE_TYPES } from '../service-types'
import { TEACHING_GROUPS } from '../teaching-groups'
import { TRANSFER_ROUND_PATTERN } from '../transfer-rounds'
import { BENEFIT_NOTE_MAX_LENGTH, LINE_ID_PATTERN, PHONE_PATTERN } from '../field-constants'
import type { FieldDef } from './fields'

// Registration fields of the teacher role, all stored on `teachers`.
// destinations are handled apart (a list, not a column).
export const TEACHER_FIELDS: readonly FieldDef[] = [
  { key: 'displayName', column: 'display_name', label: 'Name', type: 'text', required: true, adminEditable: true },
  {
    key: 'position',
    column: 'position',
    label: 'Position',
    type: 'select',
    required: true,
    options: POSITIONS.map((p) => p.code),
    public: true,
    adminEditable: true,
  },
  {
    key: 'serviceType',
    column: 'service_type',
    label: 'สพฐ (service type)',
    type: 'select',
    required: true,
    options: SERVICE_TYPES.map((s) => s.code),
    public: true,
    adminEditable: true,
  },
  {
    key: 'originProvince',
    column: 'origin_province',
    label: 'Origin Province',
    type: 'text',
    required: true,
    public: true,
    adminEditable: true,
  },
  { key: 'originDistrict', column: 'origin_district', label: 'District', type: 'text', public: true, adminEditable: true },
  { key: 'originZone', column: 'origin_zone', label: 'เขต (zone)', type: 'text', public: true, adminEditable: true },
  { key: 'currentSchool', column: 'current_school', label: 'School', type: 'text', public: true },
  {
    key: 'teachingGroup',
    column: 'teaching_group',
    label: 'Teaching Group',
    type: 'select',
    options: TEACHING_GROUPS.map((g) => g.code),
    public: true,
    adminEditable: true,
  },
  { key: 'subject', column: 'subject', label: 'Subject', type: 'text', public: true, adminEditable: true },
  {
    key: 'benefitNote',
    column: 'benefit_note',
    label: 'Benefit note',
    type: 'text',
    maxLength: BENEFIT_NOTE_MAX_LENGTH,
    public: true,
    adminEditable: true,
  },
  {
    key: 'transferRound',
    column: 'transfer_round',
    label: 'Round',
    type: 'text',
    required: true,
    pattern: TRANSFER_ROUND_PATTERN,
    public: true,
    adminEditable: true,
  },
  {
    key: 'transferYear',
    column: 'transfer_year',
    label: 'Year',
    type: 'number',
    required: true,
    min: 2000,
    max: 2100,
    public: true,
    adminEditable: true,
  },
  { key: 'phone', column: 'phone', label: 'Phone', type: 'text', pattern: PHONE_PATTERN, trim: true, adminEditable: true },
  { key: 'lineId', column: 'line_id', label: 'LINE ID', type: 'text', pattern: LINE_ID_PATTERN, trim: true, adminEditable: true },
]
