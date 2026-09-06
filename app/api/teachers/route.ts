import { NextResponse } from 'next/server'
import { LineAuthError, verifyRequestAuth } from '@/lib/line-auth'
import { profilePayloadToTeacherRow, validateProfilePayload } from '@/lib/profile-payload'
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

    if (!validateProfilePayload(body)) {
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

    const supabase = createServiceClient()

    const { data: teacher, error: upsertError } = await supabase
      .from('teachers')
      .upsert(
        { line_user_id: auth.sub, ...profilePayloadToTeacherRow(body) },
        { onConflict: 'line_user_id' }
      )
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
