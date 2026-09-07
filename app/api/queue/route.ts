import { NextResponse } from 'next/server'
import { LineAuthError, verifyRequestAuth } from '@/lib/line-auth'
import { getQueuePosition } from '@/lib/queue'
import { createServiceClient } from '@/lib/supabase-server'

// Batched-rollout queue status for the calling user (see lib/queue.ts) —
// only ever returns the caller's own status, never anyone else's.
export async function GET(request: Request) {
  try {
    const auth = await verifyRequestAuth(request)
    const supabase = createServiceClient()

    const { data: teacher, error } = await supabase
      .from('teachers')
      .select('created_at, queue_released_at')
      .eq('line_user_id', auth.sub)
      .maybeSingle()

    if (error) throw error
    if (!teacher) {
      return NextResponse.json({ released: false, position: null, totalWaiting: null })
    }
    if (teacher.queue_released_at) {
      return NextResponse.json({ released: true, position: null, totalWaiting: null })
    }

    const { position, totalWaiting } = await getQueuePosition(teacher.created_at)
    return NextResponse.json({ released: false, position, totalWaiting })
  } catch (err) {
    if (err instanceof LineAuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 })
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
