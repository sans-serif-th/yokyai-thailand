// Declarative description of one registration field of a role. Validation,
// payload→row mapping, the match-visibility allow-list and the admin edit
// whitelist are all derived from a role's FieldDef[], so adding or changing a
// field means editing its definition rather than hunting through the code.
// Pure and client-safe (the admin page imports it).

export type FieldType = 'text' | 'select' | 'number'

export interface FieldDef {
  // Key in the camelCase API payload (ProfilePayload).
  key: string
  // Column in the table that stores it (snake_case).
  column: string
  label: string
  type: FieldType
  required?: boolean
  // select: allowed values.
  options?: readonly string[]
  // text: required format (checked against the trimmed value).
  pattern?: RegExp
  // text: maximum length.
  maxLength?: number
  // number: integer range.
  min?: number
  max?: number
  // Trim and store '' as null (contact fields).
  trim?: boolean
  // May appear on another user's match card. Everything else is blanked by
  // sanitizeByFields, so a new field is private until it is marked public.
  public?: boolean
  // Editable from the admin backoffice.
  adminEditable?: boolean
}

function isBlank(value: unknown): boolean {
  return value === null || value === undefined
}

// Checks a single value against its definition. Missing (null/undefined) is
// valid unless the field is required.
export function validateFieldValue(field: FieldDef, value: unknown): boolean {
  if (isBlank(value)) return !field.required
  if (field.type === 'number') {
    if (typeof value !== 'number' || !Number.isInteger(value)) return false
    if (field.min !== undefined && value < field.min) return false
    if (field.max !== undefined && value > field.max) return false
    return true
  }
  if (typeof value !== 'string') return false
  const text = field.trim ? value.trim() : value
  if (field.required && !text.trim()) return false
  if (field.maxLength !== undefined && value.length > field.maxLength) return false
  if (field.type === 'select') return !!field.options?.includes(value)
  if (field.pattern && text && !field.pattern.test(text)) return false
  return true
}

// True when every field of `body` satisfies its definition. Fields that depend
// on other fields (e.g. teaching group only for teaching staff) are the role's
// own business on top of this.
export function validateFields(fields: readonly FieldDef[], body: Record<string, unknown>): boolean {
  return fields.every((f) => validateFieldValue(f, body[f.key]))
}

function normalize(field: FieldDef, value: unknown): unknown {
  if (isBlank(value)) return null
  if (field.trim && typeof value === 'string') return value.trim() || null
  return value
}

// Payload → column/value map for the fields of one table.
export function fieldsToRow(fields: readonly FieldDef[], payload: Record<string, unknown>): Record<string, unknown> {
  const row: Record<string, unknown> = {}
  for (const f of fields) row[f.column] = normalize(f, payload[f.key])
  return row
}

// Columns another user may see on a match card.
export function publicColumns(fields: readonly FieldDef[]): string[] {
  return fields.filter((f) => f.public).map((f) => f.column)
}

export function adminEditableFields(fields: readonly FieldDef[]): FieldDef[] {
  return fields.filter((f) => f.adminEditable)
}
