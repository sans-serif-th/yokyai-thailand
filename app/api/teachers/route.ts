import { NextResponse } from 'next/server'
import { LineAuthError, verifyRequestAuth } from '@/lib/line-auth'
import { resolveRegistrationRole } from '@/lib/roles/server'
import { getRoleImplementation } from '@/lib/roles'
import { getSubscriptionStatusFor } from '@/lib/rounds'
import { createServiceClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  try {
    const auth = await verifyRequestAuth(request)
    const supabase = createServiceClient()

    const { data: teacher, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('line_user_id', auth.sub)
      .maybeSingle()

    if (error) throw error
    if (!teacher) return NextResponse.json({ teacher: null, destinations: [] })

    const { data: destinations, error: destError } = await supabase
      .from('destinations')
      .select('*')
      .eq('teacher_id', teacher.id)

    if (destError) throw destError

    return NextResponse.json({ teacher, destinations })
  } catch (err) {
    if (err instanceof LineAuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 })
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

// Creates or fully replaces the caller's profile and destination list.
export async function PUT(request: Request) {
  try {
    const auth = await verifyRequestAuth(request)
    const body = await request.json()

    // The role is fixed when the profile is first created (see `existing`
    // below); an edit re-validates against the role the row already has.
    const supabase = createServiceClient()
    const { data: existing } = await supabase
      .from('teachers')
      .select('id, category')
      .eq('line_user_id', auth.sub)
      .maybeSingle()

    const role = existing
      ? getRoleImplementation(existing.category)
      : await resolveRegistrationRole(body)
    if (!role) {
      return NextResponse.json({ error: 'Invalid or unavailable role' }, { status: 400 })
    }
    if (!role.validateProfile(body)) {
      return NextResponse.json({ error: 'Invalid profile payload' }, { status: 400 })
    }

    const { maxDestinations } = await getSubscriptionStatusFor(auth.sub)
    if (body.destinations.length > maxDestinations) {
      return NextResponse.json(
        {
          error: `แพ็กเกจปัจจุบันของคุณเพิ่มปลายทางได้สูงสุด ${maxDestinations} แห่ง กรุณาลบปลายทางส่วนเกิน หรืออัปเกรดแพ็กเกจ`,
        },
        { status: 400 }
      )
    }

    // First registration vs. an edit to an existing profile — only the
    // former should set claimed_at (an upsert can't otherwise tell the two
    // apart and an unconditional set would clobber the real registration
    // timestamp on every profile edit) and category (the edit form doesn't
    // know the role, so writing it would reset it).
    const row = {
      line_user_id: auth.sub,
      ...role.profileToRow(body),
      ...(!existing
        ? {
            category: role.code,
            // Fixes a bug where self-registered 'app' rows never got
            // claimed_at set (only the invite-claim flow in lib/invites.ts
            // did), making every organic signup permanently invisible as a
            // match candidate to everyone else once matching opens — see
            // lib/rounds.ts (isRoundInMatchingPhase).
            claimed_at: new Date().toISOString(),
          }
        : {}),
    }

    const { data: teacher, error: upsertError } = await supabase
      .from('teachers')
      .upsert(row, { onConflict: 'line_user_id' })
      .select()
      .single()

    if (upsertError) throw upsertError

    // Replace destinations wholesale — simplest correct behavior for a
    // small, user-edited list.
    const { error: deleteError } = await supabase
      .from('destinations')
      .delete()
      .eq('teacher_id', teacher.id)
    if (deleteError) throw deleteError

    const { error: insertError } = await supabase.from('destinations').insert(
      body.destinations.map((d) => ({
        teacher_id: teacher.id,
        province: d.province,
        district: d.district ?? null,
        zone: d.zone ?? null,
      }))
    )
    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'มีจังหวัดปลายทางซ้ำกันในรายการ กรุณาเลือกจังหวัดที่ไม่ซ้ำกัน' },
          { status: 400 }
        )
      }
      throw insertError
    }

    return NextResponse.json({ teacher })
  } catch (err) {
    if (err instanceof LineAuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 })
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
