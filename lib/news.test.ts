import { describe, expect, it } from 'vitest'
import {
  formatNewsDate,
  newsPayloadToRow,
  newsVisibility,
  splitParagraphs,
  todayInBangkok,
  validateNewsPayload,
} from './news'

const base = {
  category: 'news',
  title: 'ข่าว',
  published_date: '2026-10-31',
  cover_image_url: '/news-1.png',
  heading: 'หัวข้อ',
  body: 'a\n\nb',
  published: true,
  publish_start: null,
  publish_end: null,
  sort_order: 0,
}

describe('formatNewsDate', () => {
  it('formats as day, Thai month abbreviation and 2-digit year', () => {
    expect(formatNewsDate('2026-10-31')).toBe('31 ต.ค. 2569')
    expect(formatNewsDate('2027-01-05')).toBe('5 ม.ค. 2570')
  })

  it('returns malformed input unchanged', () => {
    expect(formatNewsDate('soon')).toBe('soon')
    expect(formatNewsDate('2026-13-01')).toBe('2026-13-01')
  })
})

describe('splitParagraphs', () => {
  it('splits on blank lines and keeps single line breaks', () => {
    expect(splitParagraphs('a\nb\n\n\nc\n\n')).toEqual(['a\nb', 'c'])
    expect(splitParagraphs(null)).toEqual([])
  })
})

describe('validateNewsPayload', () => {
  it('accepts a complete payload in either category', () => {
    expect(validateNewsPayload(base)).toBe(true)
    expect(validateNewsPayload({ ...base, category: 'system' })).toBe(true)
  })

  it.each([
    ['unknown category', { category: 'video' }],
    ['missing category', { category: undefined }],
    ['blank title', { title: '  ' }],
    ['impossible date', { published_date: '2026-02-30' }],
    ['non-https remote image', { cover_image_url: 'http://x.test/a.png' }],
    ['non-integer order', { sort_order: 1.5 }],
    ['non-boolean published', { published: 'yes' }],
  ])('rejects %s', (_name, patch) => {
    expect(validateNewsPayload({ ...base, ...patch })).toBe(false)
  })
})

describe('newsPayloadToRow', () => {
  it('trims text and turns empty optional fields into null', () => {
    const row = newsPayloadToRow({
      ...(base as Parameters<typeof newsPayloadToRow>[0]),
      title: '  ข่าว ',
      heading: '  ',
      cover_image_url: '',
    })
    expect(row.title).toBe('ข่าว')
    expect(row.heading).toBeNull()
    expect(row.cover_image_url).toBeNull()
  })
})

describe('publish window', () => {
  it('accepts an open, half-open or closed window and rejects bad ones', () => {
    expect(validateNewsPayload({ ...base, publish_start: '2026-11-01', publish_end: '2026-12-31' })).toBe(true)
    expect(validateNewsPayload({ ...base, publish_start: '2026-11-01', publish_end: null })).toBe(true)
    expect(validateNewsPayload({ ...base, publish_start: '2026-11-01', publish_end: '2026-11-01' })).toBe(true)
    expect(validateNewsPayload({ ...base, publish_start: '2026-12-31', publish_end: '2026-11-01' })).toBe(false)
    expect(validateNewsPayload({ ...base, publish_start: '2026-02-30' })).toBe(false)
    expect(validateNewsPayload({ ...base, publish_end: 'soon' })).toBe(false)
  })

  it('writes empty dates as null', () => {
    const row = newsPayloadToRow({ ...base, publish_start: '' as never } as never)
    expect(row.publish_start).toBeNull()
    expect(row.publish_end).toBeNull()
  })

  it('classifies visibility on the inclusive window', () => {
    const w = { published: true, publish_start: '2026-11-01', publish_end: '2026-12-31' }
    expect(newsVisibility(w, '2026-10-31')).toBe('scheduled')
    expect(newsVisibility(w, '2026-11-01')).toBe('live')
    expect(newsVisibility(w, '2026-12-31')).toBe('live')
    expect(newsVisibility(w, '2027-01-01')).toBe('expired')
    expect(newsVisibility({ ...w, published: false }, '2026-11-15')).toBe('draft')
    expect(newsVisibility({ published: true, publish_start: null, publish_end: null }, '2030-01-01')).toBe('live')
  })

  it('counts days in Thailand, not UTC', () => {
    // 18:00 UTC on the 31st is already 1 November in Bangkok (UTC+7).
    expect(todayInBangkok(new Date('2026-10-31T18:00:00Z'))).toBe('2026-11-01')
    expect(todayInBangkok(new Date('2026-10-31T16:59:00Z'))).toBe('2026-10-31')
  })
})
