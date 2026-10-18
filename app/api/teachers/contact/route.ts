import { NextResponse } from 'next/server'
import { LineAuthError, verifyRequestAuth } from '@/lib/line-auth'
import { contactPatchToRow, validateContactPatch } from '@/lib/profile-payload'
import { createServiceClient } from '@/lib/supabase-server'

// Partial update of the caller's name / LINE ID / phone. Unlike the full
// profile PUT it touches nothing else, so it is safe for every role.
export async function PATCH(request: Request) {
  try {
    const auth = await verifyRequestAuth(request)
    const body = await request.json().catch(() => null)
    if (!validateContactPatch(body)) {
      return NextResponse.json({ error: 'Invalid contact details' }, { status: 400 })
    }

    const { data, error } = await createServiceClient()
      .from('teachers')
      .update(contactPatchToRow(body))
      .eq('line_user_id', auth.sub)
      .select()
      .maybeSingle()
    if (error) throw error
    if (!data) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }
    return NextResponse.json({ teacher: data })
  } catch (err) {
    if (err instanceof LineAuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 })
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
