import { DEMO_FIELDS, DEMO_ROLE_CODE, DEMO_ROLE_ENABLED } from './demo-fields'
import type { FieldDef } from './fields'
import { TEACHER_FIELDS } from './teacher-fields'

// Field definitions by role code. Pure (no server imports) so client code such
// as the forms and the admin page can read them; RoleImplementation.fields
// points at the same arrays. The example role is present only in dev.
const ROLE_FIELDS: Record<string, readonly FieldDef[]> = {
  teacher: TEACHER_FIELDS,
  ...(DEMO_ROLE_ENABLED ? { [DEMO_ROLE_CODE]: DEMO_FIELDS } : {}),
}

export function getRoleFields(code: string | null | undefined): readonly FieldDef[] {
  return (code && ROLE_FIELDS[code]) || []
}
