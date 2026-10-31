-- Defence in depth. Every table has row level security on and no policies, so
-- the browser-facing roles (anon, authenticated) are already denied; this also
-- takes away their table privileges, so a policy or RLS flag that goes wrong
-- later still leaves them without access. The app only talks to the database
-- from the server with the service role (lib/supabase-server.ts), which these
-- roles do not affect. Idempotent: safe to run twice.

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from anon, authenticated;

-- Objects created later (by the role that runs migrations) start without them.
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke all on functions from anon, authenticated;
