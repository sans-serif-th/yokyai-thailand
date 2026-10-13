import { beforeEach, describe, expect, it, vi } from 'vitest'

// End-to-end simulation of the contact-request flow through the real route
// handlers and lib/contacts.ts, with an in-memory Supabase and a stubbed LINE
// push endpoint. Nothing here touches the network or a real database.

type Row = Record<string, unknown>
const db: Record<string, Row[]> = { teachers: [], contact_requests: [] }
let currentUser = 'UA'

vi.mock('./supabase-server', () => {
  class Query implements PromiseLike<{ data: unknown; error: null }> {
    private filters: ((r: Row) => boolean)[] = []
    private mode: 'select' | 'update' | 'insert' = 'select'
    private patch: Row = {}
    private single_ = false
    constructor(private table: string) {}
    select() {
      return this
    }
    eq(col: string, val: unknown) {
      this.filters.push((r) => r[col] === val)
      return this
    }
    in(col: string, vals: unknown[]) {
      this.filters.push((r) => vals.includes(r[col]))
      return this
    }
    or(expr: string) {
      const parts = expr.split(',').map((p) => {
        const [col, , val] = p.split('.')
        return { col, val }
      })
      this.filters.push((r) => parts.some((p) => r[p.col] === p.val))
      return this
    }
    order() {
      return this
    }
    update(patch: Row) {
      this.mode = 'update'
      this.patch = patch
      return this
    }
    insert(row: Row) {
      this.mode = 'insert'
      this.patch = row
      return this
    }
    single() {
      this.single_ = true
      return this
    }
    maybeSingle() {
      this.single_ = true
      return this
    }
    private run() {
      const rows = db[this.table]
      if (this.mode === 'insert') {
        const row = {
          id: crypto.randomUUID(),
          status: 'pending',
          send_count: 1,
          created_at: new Date().toISOString(),
          responded_at: null,
          ...this.patch,
        }
        rows.push(row)
        return { data: this.single_ ? row : [row], error: null }
      }
      const hit = rows.filter((r) => this.filters.every((f) => f(r)))
      if (this.mode === 'update') hit.forEach((r) => Object.assign(r, this.patch))
      return { data: this.single_ ? (hit[0] ?? null) : hit, error: null }
    }
    then<T1, T2>(
      onfulfilled?: ((v: { data: unknown; error: null }) => T1 | PromiseLike<T1>) | null,
      onrejected?: ((e: unknown) => T2 | PromiseLike<T2>) | null
    ) {
      return Promise.resolve(this.run()).then(onfulfilled, onrejected)
    }
  }
  return { createServiceClient: () => ({ from: (t: string) => new Query(t) }) }
})

vi.mock('./matching', async (orig) => {
  const actual = await orig<typeof import('./matching')>()
  return {
    ...actual,
    // Everyone else is a mutual match — matching rules have their own tests.
    findMatchesFor: async (_lineUserId: string, me: { id: string }) =>
      db.teachers.filter((t) => t.id !== me.id && t.matchable !== false).map((t) => ({ teacher: t })),
  }
})

vi.mock('./line-auth', async (orig) => {
  const actual = await orig<typeof import('./line-auth')>()
  return { ...actual, verifyRequestAuth: async () => ({ sub: currentUser }) }
})

import { GET, POST } from '../app/api/contacts/route'
import { PATCH } from '../app/api/contacts/[id]/route'

const json = (body: unknown) => ({ method: 'POST', body: JSON.stringify(body) })
const req = (body?: unknown) => new Request('http://t/api/contacts', body ? json(body) : undefined)
const as = (u: string) => {
  currentUser = u
}
const call = async (res: Promise<Response>) => {
  const r = await res
  return { status: r.status, body: (await r.json()) as Record<string, any> } // eslint-disable-line @typescript-eslint/no-explicit-any
}
const send = (to: string) => call(POST(req({ teacherId: to })))
const list = async () => (await call(GET(req()))).body.contacts as Record<string, any>[] // eslint-disable-line @typescript-eslint/no-explicit-any
const patch = (id: string, action: string) =>
  call(
    PATCH(new Request('http://t', { method: 'PATCH', body: JSON.stringify({ action }) }), {
      params: Promise.resolve({ id }),
    })
  )

function teacher(id: string, name: string, extra: Row = {}): Row {
  return {
    id,
    line_user_id: `U${id}`,
    display_name: name,
    line_id: `${id.toLowerCase()}.line`,
    phone: null,
    facebook_url: null,
    position: 'teacher',
    teaching_group: 'math',
    origin_province: 'กรุงเทพมหานคร',
    ...extra,
  }
}

const pushes: { to: string; text: string }[] = []

beforeEach(() => {
  db.teachers = [teacher('A', 'สมชาย ใจดี'), teacher('B', 'สมหญิง รักเรียน')]
  db.contact_requests = []
  pushes.length = 0
  currentUser = 'UA'
  process.env.LINE_MESSAGING_ACCESS_TOKEN = 'tok'
  process.env.NEXT_PUBLIC_LIFF_ID = '1234-abcd'
  vi.stubGlobal(
    'fetch',
    vi.fn(async (_url: string, init: { body: string }) => {
      const b = JSON.parse(init.body)
      pushes.push({ to: b.to, text: b.messages[0].text })
      return new Response('{}', { status: 200 })
    })
  )
})

describe('contact request flow', () => {
  it('request → B notified, masked; accept → both reveal, A notified', async () => {
    as('UA')
    const sent = await send('B')
    expect(sent.body.status).toBe('pending')
    expect(pushes).toHaveLength(1)
    expect(pushes[0].to).toBe('UB')
    expect(pushes[0].text).toContain('https://liff.line.me/1234-abcd/contacts')
    // The push must not leak names or LINE IDs.
    expect(pushes[0].text).not.toMatch(/สมชาย|a\.line/)

    as('UB')
    const incoming = await list()
    expect(incoming).toHaveLength(1)
    expect(incoming[0]).toMatchObject({ direction: 'incoming', status: 'pending', name: null, lineId: null })

    expect((await patch(incoming[0].id, 'accept')).status).toBe(200)
    expect(pushes).toHaveLength(2)
    expect(pushes[1].to).toBe('UA')

    const forB = await list()
    expect(forB[0]).toMatchObject({ status: 'accepted', name: 'สมชาย ใจดี', lineId: 'a.line' })
    as('UA')
    const forA = await list()
    expect(forA[0]).toMatchObject({ status: 'accepted', name: 'สมหญิง รักเรียน', lineId: 'b.line' })
  })

  it('declined requests cannot be resent and never reveal the name', async () => {
    as('UA')
    const { body } = await send('B')
    as('UB')
    const id = (await list())[0].id
    await patch(id, 'decline')
    expect(pushes).toHaveLength(1) // only the original request notice
    as('UA')
    expect((await list())[0]).toMatchObject({ status: 'declined', name: null })
    const again = await send('B')
    expect(again.status).toBe(400)
    expect(body.requestId).toBe(id)
  })

  it('cancel hides the request from B; resend allowed up to 3 sends total', async () => {
    as('UA')
    const first = await send('B')
    const id = first.body.requestId as string
    expect((await patch(id, 'cancel')).status).toBe(200)

    as('UB')
    expect(await list()).toHaveLength(0)

    as('UA')
    expect((await send('B')).body.status).toBe('pending') // send 2
    await patch(id, 'cancel')
    expect((await send('B')).body.status).toBe('pending') // send 3
    await patch(id, 'cancel')
    const fourth = await send('B')
    expect(fourth.status).toBe(400)
    expect(fourth.body.error).toContain('ครบ 3 ครั้ง')
    expect(pushes).toHaveLength(3) // one per successful send
  })

  it('cancel is requester-only and pending-only', async () => {
    as('UA')
    const id = (await send('B')).body.requestId as string
    as('UB')
    expect((await patch(id, 'cancel')).status).toBe(400)
    as('UA')
    expect((await patch(id, 'accept')).status).toBe(400) // target-only
    await patch(id, 'cancel')
    expect((await patch(id, 'cancel')).status).toBe(400) // not pending any more
  })

  it('when B had cancelled, A asking flips direction and resets the count', async () => {
    as('UB')
    const id = (await send('A')).body.requestId as string
    await patch(id, 'cancel')
    as('UA')
    expect((await send('B')).body.status).toBe('pending')
    const row = db.contact_requests[0]
    expect(row).toMatchObject({ requester_id: 'A', target_id: 'B', send_count: 1 })
  })

  it('mutual requests auto-accept and notify the first requester', async () => {
    as('UA')
    await send('B')
    as('UB')
    const res = await send('A')
    expect(res.body.status).toBe('accepted')
    expect(pushes.at(-1)?.to).toBe('UA')
  })

  it('guards: non-match, missing LINE ID', async () => {
    db.teachers.push(teacher('C', 'ไม่ใช่คู่', { matchable: false }))
    as('UA')
    expect((await send('C')).status).toBe(400)

    db.teachers.push(teacher('D', 'ไม่มีไลน์', { line_id: null }))
    as('UD')
    const noId = await send('A')
    expect(noId.status).toBe(400)
    expect(noId.body.error).toContain('LINE ID')

    as('UA')
    const id = (await send('B')).body.requestId as string
    db.teachers.find((t) => t.id === 'B')!.line_id = null
    as('UB')
    expect((await patch(id, 'accept')).status).toBe(400)
  })

  it('notifications are best-effort', async () => {
    delete process.env.LINE_MESSAGING_ACCESS_TOKEN
    as('UA')
    expect((await send('B')).status).toBe(200)
    expect(pushes).toHaveLength(0)

    process.env.LINE_MESSAGING_ACCESS_TOKEN = 'tok'
    vi.stubGlobal('fetch', vi.fn(async () => new Response('forbidden', { status: 403 })))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    db.contact_requests = []
    expect((await send('B')).status).toBe(200)

    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('network') }))
    db.contact_requests = []
    expect((await send('B')).status).toBe(200)
  })
})
