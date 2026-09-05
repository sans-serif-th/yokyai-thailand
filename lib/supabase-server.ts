import { createClient } from '@supabase/supabase-js'

// Server-only client using the service role key. Bypasses Row Level
// Security, so this must never be imported into client components — only
// into route handlers (app/api/**/route.ts). Every query built with this
// client must scope itself explicitly to a verified line_user_id.
export function createServiceClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) or SUPABASE_SERVICE_ROLE_KEY environment variables'
    )
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  })
}
