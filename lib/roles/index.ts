import { demoRole } from './demo'
import { DEMO_ROLE_ENABLED } from './demo-fields'
import { teacherRole } from './teacher'
import type { RoleImplementation } from './types'

// Roles that have code behind them. A row in the `categories` table without an
// entry here is just a name on the welcome screen ("เร็วๆนี้") and can't be
// activated from /admin/roles.
export const ROLE_IMPLEMENTATIONS: Record<string, RoleImplementation> = {
  [teacherRole.code]: teacherRole,
  // Example role for development only: absent unless NEXT_PUBLIC_DEV_TOOLS=1.
  ...(DEMO_ROLE_ENABLED ? { [demoRole.code]: demoRole } : {}),
}

export function getRoleImplementation(code: string | null | undefined): RoleImplementation | null {
  return (code && ROLE_IMPLEMENTATIONS[code]) || null
}

export function hasRoleImplementation(code: string): boolean {
  return getRoleImplementation(code) !== null
}
