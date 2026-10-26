// Home ("อัพเดท") news. Rows live in the `news` table (0026_news.sql) and are
// edited from /admin/news; this file holds the shared types plus the pure
// helpers (date label, payload validation) so they can be unit-tested.
// Home news is grouped as ข่าวสาร (announcements) or ระบบ (how the system works).
export type NewsCategory = 'news' | 'system'

export const NEWS_CATEGORIES: { value: NewsCategory; label: string }[] = [
  { value: 'news', label: 'ข่าวสาร' },
  { value: 'system', label: 'ระบบ' },
]

export function newsCategoryLabel(category: NewsCategory): string {
  return NEWS_CATEGORIES.find((c) => c.value === category)?.label ?? category
}

export interface NewsPayload {
  category: NewsCategory
  title: string
  // YYYY-MM-DD
  published_date: string
  cover_image_url: string | null
  // Paragraphs separated by a blank line.
  body: string | null
  published: boolean
  // Optional visibility window (YYYY-MM-DD, inclusive, Thai calendar day);
  // null = no limit on that side. Only matters while `published` is true.
  publish_start: string | null
  publish_end: string | null
  sort_order: number
}

export interface NewsItem extends NewsPayload {
  id: string
}

// What the home list needs — the detail fields load on the detail page.
export type NewsSummary = Pick<NewsItem, 'id' | 'title' | 'published_date' | 'cover_image_url'>

export const NEWS_SUMMARY_COLUMNS = 'id, title, published_date, cover_image_url'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const isNewsId = (v: string) => UUID_PATTERN.test(v)

const THAI_MONTHS_SHORT = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
]

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

// "2026-10-31" -> "31 ต.ค. 2569" (Thai month abbreviation, พ.ศ. year).
// Parsed from the string, not via Date, so the label never shifts with the
// viewer's timezone.
export function formatNewsDate(isoDate: string): string {
  const m = DATE_PATTERN.exec(isoDate)
  if (!m) return isoDate
  const month = THAI_MONTHS_SHORT[Number(m[2]) - 1]
  if (!month) return isoDate
  return `${Number(m[3])} ${month} ${Number(m[1]) + 543}`
}

// Today's date in Thailand (YYYY-MM-DD) — the news window is counted in Thai
// calendar days regardless of the server's timezone.
export function todayInBangkok(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

export type NewsVisibility = 'draft' | 'scheduled' | 'live' | 'expired'

export function newsVisibility(
  item: Pick<NewsPayload, 'published' | 'publish_start' | 'publish_end'>,
  today: string = todayInBangkok()
): NewsVisibility {
  if (!item.published) return 'draft'
  if (item.publish_start && today < item.publish_start) return 'scheduled'
  if (item.publish_end && today > item.publish_end) return 'expired'
  return 'live'
}

// Bodies saved from the editor are HTML; older ones are plain paragraphs
// separated by a blank line.
export function isHtmlBody(body: string | null): boolean {
  return !!body && body.trimStart().startsWith('<')
}

export function splitParagraphs(body: string | null): string[] {
  if (!body) return []
  return body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
}

const TITLE_MAX = 200
// HTML from the editor is longer than the plain paragraphs it replaces.
const BODY_MAX = 50000
const URL_MAX = 1000

function isImageUrl(v: unknown): v is string {
  return typeof v === 'string' && v.length <= URL_MAX && (v.startsWith('/') || v.startsWith('https://'))
}

function isValidDate(v: unknown): v is string {
  if (typeof v !== 'string') return false
  const m = DATE_PATTERN.exec(v)
  if (!m) return false
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])))
  return d.getUTCMonth() === Number(m[2]) - 1 && d.getUTCDate() === Number(m[3])
}

function isOptionalText(v: unknown, max: number) {
  return v === null || v === undefined || (typeof v === 'string' && v.length <= max)
}

export function validateNewsPayload(body: unknown): body is NewsPayload {
  if (!body || typeof body !== 'object') return false
  const b = body as Record<string, unknown>
  if (!NEWS_CATEGORIES.some((c) => c.value === b.category)) return false
  if (typeof b.title !== 'string' || !b.title.trim() || b.title.length > TITLE_MAX) return false
  if (!isValidDate(b.published_date)) return false
  if (b.cover_image_url !== null && b.cover_image_url !== undefined && !isImageUrl(b.cover_image_url)) {
    return false
  }
  if (!isOptionalText(b.body, BODY_MAX)) return false
  if (typeof b.published !== 'boolean') return false
  for (const key of ['publish_start', 'publish_end'] as const) {
    if (b[key] !== null && b[key] !== undefined && !isValidDate(b[key])) return false
  }
  if (b.publish_start && b.publish_end && (b.publish_start as string) > (b.publish_end as string)) {
    return false
  }
  if (typeof b.sort_order !== 'number' || !Number.isInteger(b.sort_order)) return false
  return true
}

// Normalises a validated payload into the column values to write.
export function newsPayloadToRow(p: NewsPayload) {
  return {
    category: p.category,
    title: p.title.trim(),
    published_date: p.published_date,
    cover_image_url: p.cover_image_url || null,
    body: p.body?.trim() || null,
    published: p.published,
    publish_start: p.publish_start || null,
    publish_end: p.publish_end || null,
    sort_order: p.sort_order,
  }
}
