// Client-safe constants shared between lib/rounds.ts (server) and
// components that need the free-tier default without pulling in the
// server-only Supabase client (see lib/supabase-server.ts).
export const FREE_DESTINATION_LIMIT = 1
export const PAID_DESTINATION_LIMIT = 3
