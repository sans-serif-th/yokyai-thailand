import { checkAdminToken } from '@/lib/admin-token'
import { createServiceClient } from '@/lib/supabase-server'

// Newest first. Capped: the list is for a person to read, and spam is already
// limited per user per day (lib/rate-limit.ts).
const LIMIT = 200

export async function GET(request: Request) {
  if (!checkAdminToken(new URL(request.url).searchParams.get('token'))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await createServiceClient()
    .from('position_requests')
    .select('id, line_user_id, position_name, transfer_round, criteria, contact_consent, handled_at, created_at')
    .order('created_at', { ascending: false })
    .limit(LIMIT)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}
