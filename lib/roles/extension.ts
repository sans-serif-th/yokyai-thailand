import type { SupabaseClient } from '@supabase/supabase-js'
import type { ProfilePayload } from '../types'
import { fieldsInTable, fieldsToRow, type FieldDef } from './fields'
import type { RoleImplementation } from './types'

function extensionFields(role: RoleImplementation): readonly FieldDef[] {
  return role.extensionTable ? fieldsInTable(role.fields, role.extensionTable) : []
}

// Upserts the role-specific part of a registration. No-op for roles without an
// extension table.
export async function saveExtension(
  supabase: SupabaseClient,
  role: RoleImplementation,
  teacherId: string,
  payload: ProfilePayload
): Promise<void> {
  const fields = extensionFields(role)
  if (!role.extensionTable || fields.length === 0) return
  const row = { teacher_id: teacherId, ...fieldsToRow(fields, payload.profile ?? {}) }
  const { error } = await supabase.from(role.extensionTable).upsert(row, { onConflict: 'teacher_id' })
  if (error) throw error
}

// Role-specific fields keyed by FieldDef.key (the shape of ProfilePayload.profile),
// or null when the role has none / nothing is stored yet.
export async function loadExtension(
  supabase: SupabaseClient,
  role: RoleImplementation | null,
  teacherId: string
): Promise<Record<string, unknown> | null> {
  const fields = role ? extensionFields(role) : []
  if (!role?.extensionTable || fields.length === 0) return null
  const { data, error } = await supabase
    .from(role.extensionTable)
    .select('*')
    .eq('teacher_id', teacherId)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  return Object.fromEntries(fields.map((f) => [f.key, data[f.column] ?? null]))
}
