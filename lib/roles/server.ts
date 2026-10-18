import { createServiceClient } from '../supabase-server'
import type { RoleInfo } from '../types'
import { getRoleImplementation } from './index'
import type { RoleImplementation } from './types'

export async function listRoles(): Promise<RoleInfo[]> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('categories')
    .select('code, name_th, name_en, status, sort_order')
    .order('sort_order')
    .order('code')
  if (error) throw error
  return (data ?? []) as RoleInfo[]
}

// The role a new registration is for: the payload's `category` (default
// 'teacher' for older clients). Null when it isn't an active role with code
// behind it.
export async function resolveRegistrationRole(body: unknown): Promise<RoleImplementation | null> {
  const raw = (body as { category?: unknown } | null)?.category
  const code = raw === undefined || raw === null ? 'teacher' : raw
  if (typeof code !== 'string') return null
  const impl = getRoleImplementation(code)
  if (!impl) return null

  const supabase = createServiceClient()
  const { data } = await supabase.from('categories').select('status').eq('code', code).maybeSingle()
  return data?.status === 'active' ? impl : null
}
