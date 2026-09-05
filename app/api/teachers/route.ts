import { NextResponse } from 'next/server'
import { LineAuthError, verifyRequestAuth } from '@/lib/line-auth'
import { POSITIONS, requiresTeachingGroup } from '@/lib/positions'
import { SERVICE_TYPES } from '@/lib/service-types'
import { createServiceClient } from '@/lib/supabase-server'
import { TEACHING_GROUPS } from '@/lib/teaching-groups'

interface ProfilePayload {
  displayName: string
  position: string
  serviceType: string
  originProvince: string
  originDistrict?: string | null
  originZone?: string | null
  currentSchool?: string | null
  teachingGroup: string | null
  subject?: string | null
  benefitNote?: string | null
  transferRound?: number | null
  destinations: { province: string; district?: string | null; zone?: string | null }[]
}

const BENEFIT_NOTE_MAX_LENGTH = 500

function validatePayload(body: unknown): body is ProfilePayload {
  if (!body || typeof body !== 'object') return false
  const b = body as Record<string, unknown>
  if (typeof b.displayName !== 'string' || !b.displayName.trim()) return false
  if (typeof b.position !== 'string') return false
  if (!POSITIONS.some((p) => p.code === b.position)) return false
  if (typeof b.serviceType !== 'string') return false
  if (!SERVICE_TYPES.some((s) => s.code === b.serviceType)) return false
  if (typeof b.originProvince !== 'string' || !b.originProvince.trim()) return false
  if (requiresTeachingGroup(b.position)) {
    if (typeof b.teachingGroup !== 'string') return false
    if (!TEACHING_GROUPS.some((g) => g.code === b.teachingGroup)) return false
  } else if (b.teachingGroup !== null && b.teachingGroup !== undefined) {
    return false
  }
  if (b.benefitNote !== null && b.benefitNote !== undefined) {
    if (typeof b.benefitNote !== 'string' || b.benefitNote.length > BENEFIT_NOTE_MAX_LENGTH) {
      return false
    }
  }
  if (b.transferRound !== null && b.transferRound !== undefined) {
    if (typeof b.transferRound !== 'number' || !Number.isInteger(b.transferRound)) return false
  }
  if (!Array.isArray(b.destinations) || b.destinations.length === 0) return false
  return b.destinations.every(
    (d) => d && typeof d === 'object' && typeof (d as { province?: unknown }).province === 'string'
  )
}

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

    if (!validatePayload(body)) {
      return NextResponse.json({ error: 'Invalid profile payload' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { data: teacher, error: upsertError } = await supabase
      .from('teachers')
      .upsert(
        {
          line_user_id: auth.sub,
          display_name: body.displayName,
          position: body.position,
          service_type: body.serviceType,
          origin_province: body.originProvince,
          origin_district: body.originDistrict ?? null,
          origin_zone: body.originZone ?? null,
          current_school: body.currentSchool ?? null,
          teaching_group: requiresTeachingGroup(body.position) ? body.teachingGroup : null,
          subject: requiresTeachingGroup(body.position) ? (body.subject ?? null) : null,
          benefit_note: body.benefitNote ?? null,
          transfer_round: body.transferRound ?? null,
        },
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
    if (insertError) throw insertError

    return NextResponse.json({ teacher })
  } catch (err) {
    if (err instanceof LineAuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 })
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
