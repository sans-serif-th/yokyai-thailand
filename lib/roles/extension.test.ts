import { describe, expect, it, vi } from 'vitest'
import { loadExtension, saveExtension } from './extension'
import type { FieldDef } from './fields'
import type { RoleImplementation } from './types'
import type { ProfilePayload } from '../types'

const fields: FieldDef[] = [
  { key: 'displayName', column: 'display_name', label: 'Name', type: 'text' },
  { key: 'specialty', column: 'specialty', label: 'S', type: 'text', table: 'x_profiles' },
  { key: 'years', column: 'years_experience', label: 'Y', type: 'number', table: 'x_profiles' },
]
const role = { code: 'x', fields, extensionTable: 'x_profiles' } as unknown as RoleImplementation
const plain = { code: 'p', fields } as unknown as RoleImplementation

describe('role extension storage', () => {
  it('upserts only the extension-table fields keyed by teacher_id', async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null })
    const from = vi.fn(() => ({ upsert }))
    const payload = { profile: { specialty: 'ICU', years: 4 } } as unknown as ProfilePayload
    await saveExtension({ from } as never, role, 't1', payload)
    expect(from).toHaveBeenCalledWith('x_profiles')
    expect(upsert).toHaveBeenCalledWith(
      { teacher_id: 't1', specialty: 'ICU', years_experience: 4 },
      { onConflict: 'teacher_id' }
    )
  })

  it('does nothing for a role without an extension table', async () => {
    const from = vi.fn()
    await saveExtension({ from } as never, plain, 't1', {} as ProfilePayload)
    expect(from).not.toHaveBeenCalled()
    expect(await loadExtension({ from } as never, plain, 't1')).toBeNull()
  })

  it('loads the extension row back under payload keys', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: { teacher_id: 't1', specialty: 'ICU', years_experience: 4 }, error: null })
    const from = vi.fn(() => ({ select: () => ({ eq: () => ({ maybeSingle }) }) }))
    expect(await loadExtension({ from } as never, role, 't1')).toEqual({ specialty: 'ICU', years: 4 })
  })
})
