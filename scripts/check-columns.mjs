// อ่านอย่างเดียว: ตรวจว่า DB มีทุกตารางและคอลัมน์ที่ supabase/schema.sql ประกาศไว้
// (ผ่าน REST API ด้วย service role key; ไม่เขียนอะไร และไม่พิมพ์ key)
//
//   SUPABASE_URL=https://<โปรเจกต์>.supabase.co SUPABASE_SERVICE_ROLE_KEY=<key> \
//     node scripts/check-columns.mjs
//   node scripts/check-columns.mjs --parse-only   # แค่แสดงสิ่งที่อ่านได้จาก schema.sql
//
// ใช้หลังรัน migration หรือเมื่อสงสัยว่าโครงสร้างหลุด (เคยเจอ teachers.admin_status หาย)
// ใส่ key ของโปรเจกต์ที่จะตรวจเท่านั้น และตรวจชื่อโปรเจกต์ที่สคริปต์พิมพ์ก่อนอ่านผล
import { readFileSync } from 'node:fs'

const NOT_COLUMNS = new Set(['unique', 'check', 'primary', 'foreign', 'constraint', 'like', 'exclude'])

export function parseSchema(sql) {
  const tables = new Map()
  const re = /^create table (?:if not exists )?(?:public\.)?([a-z_][a-z0-9_]*)\s*\(\s*$/gim
  let m
  while ((m = re.exec(sql))) {
    const columns = []
    for (const line of sql.slice(re.lastIndex).split('\n')) {
      if (/^\);/.test(line)) break
      // Column lines are indented exactly 2 spaces; deeper lines continue one.
      const c = /^ {2}([a-z_][a-z0-9_]*)\s+\S/i.exec(line)
      if (c && !NOT_COLUMNS.has(c[1].toLowerCase())) columns.push(c[1])
    }
    tables.set(m[1], columns)
  }
  return tables
}

async function main() {
  const tables = parseSchema(readFileSync(new URL('../supabase/schema.sql', import.meta.url), 'utf-8'))
  const total = [...tables.values()].reduce((n, c) => n + c.length, 0)
  console.log(`schema.sql: ${tables.size} ตาราง, ${total} คอลัมน์`)
  if (process.argv.includes('--parse-only')) {
    for (const [t, cols] of tables) console.log(`  ${t}: ${cols.join(', ')}`)
    return
  }

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('ต้องตั้ง SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY (ดูหัวไฟล์)')
    process.exit(2)
  }
  const host = new URL(url).host
  console.log(`ตรวจโปรเจกต์: ${host}`)

  // `limit=0` returns no rows; a missing column or table comes back as 4xx.
  async function exists(table, column) {
    const res = await fetch(`${url}/rest/v1/${table}?select=${column}&limit=0`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    })
    if (res.ok) return true
    if (res.status === 401 || res.status === 403) {
      console.error(`key ใช้ไม่ได้กับ ${host} (HTTP ${res.status})`)
      process.exit(2)
    }
    return false
  }

  const missing = []
  for (const [table, columns] of tables) {
    if (!(await exists(table, '*'))) {
      missing.push(`${table} (ทั้งตาราง)`)
      continue
    }
    // One request per table first; only drill into columns when it fails.
    if (await exists(table, columns.join(','))) continue
    for (const column of columns) {
      if (!(await exists(table, column))) missing.push(`${table}.${column}`)
    }
  }

  if (missing.length === 0) {
    console.log('ครบทุกตารางและคอลัมน์')
    return
  }
  console.log(`ขาด ${missing.length} รายการ:`)
  for (const item of missing) console.log(`  - ${item}`)
  process.exit(1)
}

if (import.meta.url === `file://${process.argv[1]}`) await main()
