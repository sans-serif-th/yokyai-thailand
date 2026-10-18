import { beforeEach, describe, expect, it, vi } from 'vitest'
import { checkDelete, checkStatusChange, validateNewRole } from './admin-rules'
import { getRoleImplementation, hasRoleImplementation } from './index'
import { countMutualPairs, listCrossPairs, listMutualPairs } from './pairs'
import type { PairRow } from './types'

const roles = [
  { code: 'teacher', status: 'active' as const },
  { code: 'nurse', status: 'coming_soon' as const },
  { code: 'physician', status: 'hidden' as const },
]

describe('registry', () => {
  it('has teacher only', () => {
    expect(hasRoleImplementation('teacher')).toBe(true)
    expect(hasRoleImplementation('nurse')).toBe(false)
    expect(getRoleImplementation('nurse')).toBeNull()
    expect(getRoleImplementation(null)).toBeNull()
  })
})

describe('checkStatusChange', () => {
  it('allows activating only roles with code', () => {
    expect(checkStatusChange(roles, 'nurse', 'active', false).ok).toBe(false)
    expect(checkStatusChange(roles, 'nurse', 'active', true).ok).toBe(true)
  })

  it('keeps at least one role active', () => {
    expect(checkStatusChange(roles, 'teacher', 'hidden', true).ok).toBe(false)
    const two = [...roles.slice(0, 1), { code: 'nurse', status: 'active' as const }]
    expect(checkStatusChange(two, 'teacher', 'coming_soon', true).ok).toBe(true)
  })

  it('moves between coming_soon and hidden freely', () => {
    expect(checkStatusChange(roles, 'nurse', 'hidden', false).ok).toBe(true)
    expect(checkStatusChange(roles, 'physician', 'coming_soon', false).ok).toBe(true)
  })

  it('rejects unknown status and role', () => {
    expect(checkStatusChange(roles, 'nurse', 'nope' as never, true).ok).toBe(false)
    expect(checkStatusChange(roles, 'ghost', 'hidden', false).ok).toBe(false)
  })
})

describe('checkDelete / validateNewRole', () => {
  it('never deletes teacher or a role with users', () => {
    expect(checkDelete({ code: 'teacher' }, 0).ok).toBe(false)
    expect(checkDelete({ code: 'nurse' }, 3).ok).toBe(false)
    expect(checkDelete({ code: 'nurse' }, 0).ok).toBe(true)
  })

  it('validates a new role', () => {
    expect(validateNewRole({ code: 'dentist', name_th: 'ทันตแพทย์', name_en: 'Dentist' }).ok).toBe(true)
    expect(validateNewRole({ code: 'Bad Code', name_th: 'x', name_en: 'y' }).ok).toBe(false)
    expect(validateNewRole({ code: 'ok_code', name_th: ' ', name_en: 'y' }).ok).toBe(false)
    expect(validateNewRole(null).ok).toBe(false)
  })
})

function row(over: Partial<PairRow>): PairRow {
  return {
    category: 'teacher',
    position: 'teacher',
    service_type: 'primary',
    subject: 'เอกคณิตศาสตร์',
    origin_province: 'กรุงเทพมหานคร',
    destinations: [{ id: 'd', teacher_id: 't', province: 'เชียงใหม่', district: null, zone: null }],
    ...over,
  }
}
const a = row({})
const b = row({
  origin_province: 'เชียงใหม่',
  destinations: [{ id: 'd2', teacher_id: 't2', province: 'กรุงเทพมหานคร', district: null, zone: null }],
})

describe('mutual pairs', () => {
  it('pairs reciprocal teachers with the same subject', () => {
    expect(countMutualPairs([a, b])).toBe(1)
    expect(listMutualPairs([a, b])[0]).toEqual({ a, b })
  })

  it('needs the exact subject for teachers', () => {
    expect(countMutualPairs([a, { ...b, subject: 'เอกฟิสิกส์' }])).toBe(0)
    expect(countMutualPairs([{ ...a, subject: null }, { ...b, subject: null }])).toBe(0)
  })

  it('treats a missing category as teacher', () => {
    expect(countMutualPairs([{ ...a, category: undefined }, { ...b, category: null }])).toBe(1)
  })

  it('never pairs across roles, and skips roles without code', () => {
    expect(countMutualPairs([a, { ...b, category: 'nurse' }])).toBe(0)
    expect(countMutualPairs([{ ...a, category: 'nurse' }, { ...b, category: 'nurse' }])).toBe(0)
  })

  it('cross pairs stay within one role', () => {
    expect(listCrossPairs([a], [b])).toHaveLength(1)
    expect(listCrossPairs([a], [{ ...b, category: 'nurse' }])).toHaveLength(0)
  })
})

describe('resolveRegistrationRole', () => {
  let status: string | null = 'active'
  beforeEach(() => {
    status = 'active'
    vi.resetModules()
    vi.doMock('../supabase-server', () => ({
      createServiceClient: () => ({
        from: () => ({
          select: () => ({
            eq: () => ({ maybeSingle: async () => ({ data: status ? { status } : null }) }),
          }),
        }),
      }),
    }))
  })

  it('defaults to teacher when category is omitted', async () => {
    const { resolveRegistrationRole } = await import('./server')
    expect((await resolveRegistrationRole({}))?.code).toBe('teacher')
    expect((await resolveRegistrationRole({ category: 'teacher' }))?.code).toBe('teacher')
  })

  it('rejects inactive, unimplemented and malformed roles', async () => {
    const { resolveRegistrationRole } = await import('./server')
    expect(await resolveRegistrationRole({ category: 'nurse' })).toBeNull()
    expect(await resolveRegistrationRole({ category: 5 })).toBeNull()
    status = 'coming_soon'
    expect(await resolveRegistrationRole({ category: 'teacher' })).toBeNull()
    status = null
    expect(await resolveRegistrationRole({})).toBeNull()
  })
})

describe('role field definitions', () => {
  it('teacher fields expose the same public columns as before the refactor', async () => {
    const { MATCH_VISIBLE_FIELDS } = await import('../match-sanitize')
    expect([...MATCH_VISIBLE_FIELDS].sort()).toEqual(
      [
        'id', 'position', 'service_type', 'origin_province', 'origin_district', 'origin_zone',
        'current_school', 'teaching_group', 'subject', 'benefit_note', 'transfer_round',
        'transfer_year', 'source', 'claimed_at', 'category',
      ].sort()
    )
  })

  it('never makes contact details public', async () => {
    const { publicColumns } = await import('./fields')
    const { TEACHER_FIELDS } = await import('./teacher-fields')
    const pub = publicColumns(TEACHER_FIELDS)
    for (const c of ['display_name', 'phone', 'line_id']) expect(pub).not.toContain(c)
  })
})

describe('demo role', () => {
  it('validates core fields and the extension profile', async () => {
    const { demoRole } = await import('./demo')
    const ok = {
      displayName: 'A B',
      originProvince: 'เชียงใหม่',
      profile: { specialty: 'icu', yearsExperience: 3, workplace: 'โรงพยาบาล' },
      destinations: [{ province: 'ขอนแก่น', district: null, zone: null }],
    }
    expect(demoRole.validateProfile(ok)).toBe(true)
    expect(demoRole.validateProfile({ ...ok, profile: { ...ok.profile, specialty: 'x' } })).toBe(false)
    expect(demoRole.validateProfile({ ...ok, profile: undefined })).toBe(false)
    expect(demoRole.validateProfile({ ...ok, profile: { ...ok.profile, yearsExperience: 99 } })).toBe(false)
    expect(demoRole.profileToRow(ok as never)).toMatchObject({ display_name: 'A B', origin_province: 'เชียงใหม่' })
    expect(demoRole.profileToRow(ok as never)).not.toHaveProperty('specialty')
  })

  it('pairs only reciprocal provinces with the same specialty', async () => {
    const { demoRole } = await import('./demo')
    const a = { origin_province: 'X', destinations: [{ province: 'Y' }], profile: { specialty: 'icu' } } as never
    const b = { origin_province: 'Y', destinations: [{ province: 'X' }], profile: { specialty: 'icu' } } as never
    const c = { origin_province: 'Y', destinations: [{ province: 'X' }], profile: { specialty: 'er' } } as never
    expect(demoRole.isMutualPair(a, b)).toBe(true)
    expect(demoRole.isMutualPair(a, c)).toBe(false)
  })

  it('sanitize hides non-public data but keeps public profile keys', async () => {
    // The demo role is registered only with dev tools on.
    vi.stubEnv('NEXT_PUBLIC_DEV_TOOLS', '1')
    vi.resetModules()
    const { sanitizeForMatch } = await import('../match-sanitize')
    const out = sanitizeForMatch({
      id: '1', category: 'demo', display_name: 'สมชาย ใจดี', phone: '0812345678', line_id: 'abc1234',
      origin_province: 'X', profile: { specialty: 'icu', secret: 'nope' },
    } as never) as unknown as Record<string, unknown>
    expect(out.phone).toBeNull()
    expect(out.line_id).toBeNull()
    expect(out.origin_province).toBe('X')
    expect(out.profile).toEqual({ specialty: 'icu' })
    vi.unstubAllEnvs()
  })
})
