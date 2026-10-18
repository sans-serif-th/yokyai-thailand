import type { FieldDef } from './fields'
import { TEACHER_FIELDS } from './teacher-fields'

// Field definitions by role code. Pure (no server imports) so client code such
// as the admin page can read them; RoleImplementation.fields points at the
// same arrays.
const ROLE_FIELDS: Record<string, readonly FieldDef[]> = {
  teacher: TEACHER_FIELDS,
}

export function getRoleFields(code: string | null | undefined): readonly FieldDef[] {
  return (code && ROLE_FIELDS[code]) || []
}
