import type { RoleInfo, RoleStatus } from '../types'

export const ROLE_CODE_PATTERN = /^[a-z][a-z0-9_]{1,30}$/
export const ROLE_STATUSES: RoleStatus[] = ['active', 'coming_soon', 'hidden']

export type RuleResult = { ok: true } | { ok: false; error: string }
const ok: RuleResult = { ok: true }
const fail = (error: string): RuleResult => ({ ok: false, error })

export function validateNewRole(body: unknown): RuleResult {
  const b = (body ?? {}) as Record<string, unknown>
  if (typeof b.code !== 'string' || !ROLE_CODE_PATTERN.test(b.code)) {
    return fail('Code must be 2-31 characters: lowercase a-z, 0-9 or underscore, starting with a letter')
  }
  if (typeof b.name_th !== 'string' || !b.name_th.trim()) return fail('Thai name is required')
  if (typeof b.name_en !== 'string' || !b.name_en.trim()) return fail('English name is required')
  return ok
}

// `roles` is the current table; `hasImplementation` says whether code for the
// role is registered in lib/roles/index.ts.
export function checkStatusChange(
  roles: Pick<RoleInfo, 'code' | 'status'>[],
  code: string,
  next: RoleStatus,
  hasImplementation: boolean
): RuleResult {
  if (!ROLE_STATUSES.includes(next)) return fail('Invalid status')
  const current = roles.find((r) => r.code === code)
  if (!current) return fail('Role not found')
  if (next === 'active' && !hasImplementation) {
    return fail('This role has no implementation in code yet, so it cannot be activated')
  }
  if (current.status === 'active' && next !== 'active') {
    const otherActive = roles.some((r) => r.code !== code && r.status === 'active')
    if (!otherActive) return fail('At least one role must stay active')
  }
  return ok
}

export function checkDelete(role: Pick<RoleInfo, 'code'>, userCount: number): RuleResult {
  if (role.code === 'teacher') return fail('The teacher role cannot be deleted')
  if (userCount > 0) return fail(`${userCount} user(s) still have this role`)
  return ok
}
