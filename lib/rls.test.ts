import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const DIR = join(process.cwd(), 'supabase')
const files = [
  join(DIR, 'schema.sql'),
  ...readdirSync(join(DIR, 'migrations'))
    .filter((f) => f.endsWith('.sql'))
    .map((f) => join(DIR, 'migrations', f)),
]
const sql = files.map((f) => readFileSync(f, 'utf-8')).join('\n')

// Tables in the public schema: `create table [if not exists] name` with no
// schema prefix (storage.* and the like belong to Supabase).
const tables = new Set(
  [...sql.matchAll(/create table (?:if not exists )?(?:public\.)?([a-z_][a-z0-9_]*)\s*\(/gi)].map((m) => m[1])
)
const rlsOn = new Set(
  [...sql.matchAll(/alter table (?:if exists )?(?:public\.)?([a-z_][a-z0-9_]*) enable row level security/gi)].map(
    (m) => m[1]
  )
)

describe('row level security', () => {
  it('finds the tables', () => {
    expect(tables.size).toBeGreaterThan(10)
  })

  // The app reads and writes only through the service role, so no table needs a
  // policy: RLS on with no policy means the browser-facing roles get nothing.
  it('is enabled on every table the migrations create', () => {
    expect([...tables].filter((t) => !rlsOn.has(t))).toEqual([])
  })

  it('has no policy that would open a table to client roles', () => {
    expect(sql).not.toMatch(/create policy/i)
  })
})
