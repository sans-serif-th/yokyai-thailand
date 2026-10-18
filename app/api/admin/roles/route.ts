import { checkAdminToken } from '@/lib/admin-token'
import { hasRoleImplementation } from '@/lib/roles'
import { validateNewRole } from '@/lib/roles/admin-rules'
import { listRoles } from '@/lib/roles/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  if (!checkAdminToken(new URL(request.url).searchParams.get('token'))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const roles = await listRoles()
    const supabase = createServiceClient()
    const withCounts = await Promise.all(
      roles.map(async (role) => {
        const { count, error } = await supabase
          .from('teachers')
          .select('id', { count: 'exact', head: true })
          .eq('category', role.code)
        if (error) throw error
        return { ...role, userCount: count ?? 0, hasImplementation: hasRoleImplementation(role.code) }
      })
    )
    return Response.json(withCounts)
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}

// New roles start as 'coming_soon' — they can only be activated once code for
// them exists (see lib/roles/index.ts).
export async function POST(request: Request) {
  if (!checkAdminToken(new URL(request.url).searchParams.get('token'))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const rule = validateNewRole(body)
  if (!rule.ok) return Response.json({ error: rule.error }, { status: 400 })

  const supabase = createServiceClient()
  const { data: last } = await supabase
    .from('categories')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data, error } = await supabase
    .from('categories')
    .insert({
      code: body.code,
      name_th: body.name_th.trim(),
      name_en: body.name_en.trim(),
      status: 'coming_soon',
      sort_order: (last?.sort_order ?? -1) + 1,
    })
    .select('code, name_th, name_en, status, sort_order')
    .single()
  if (error) {
    const duplicate = error.code === '23505'
    return Response.json(
      { error: duplicate ? 'Role code already exists' : error.message },
      { status: duplicate ? 409 : 500 }
    )
  }
  return Response.json(data, { status: 201 })
}
