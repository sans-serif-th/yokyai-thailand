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

// PostgREST caps any select at 1000 rows by default (Supabase's max-rows
// setting) — a query with no .range() silently truncates once the table
// passes that size instead of erroring, which is easy to miss until a
// dashboard quietly starts under-reporting. Any query that needs the FULL
// matching table (not a narrowly-filtered lookup that's expected to stay
// small) should page through with this helper instead of awaiting the
// builder directly. `makeQuery` must build the query fresh each call (apply
// the same filters, then .range(from, to)) rather than reusing one builder
// instance across pages.
export async function fetchAllRows<T>(
  makeQuery: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>
): Promise<{ data: T[] | null; error: { message: string } | null }> {
  const PAGE_SIZE = 1000
  const all: T[] = []
  let from = 0

  while (true) {
    const { data, error } = await makeQuery(from, from + PAGE_SIZE - 1)
    if (error) return { data: null, error }
    if (!data || data.length === 0) break
    all.push(...data)
    if (data.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }

  return { data: all, error: null }
}
