import { describe, expect, it } from 'vitest'
import { formatNewsDate, newsPayloadToRow, splitParagraphs, validateNewsPayload } from './news'

const base = {
  layout: 'article',
  title: 'ข่าว',
  published_date: '2026-10-31',
  cover_image_url: '/news-1.png',
  heading: 'หัวข้อ',
  body: 'a\n\nb',
  steps: [],
  published: true,
  sort_order: 0,
}

describe('formatNewsDate', () => {
  it('formats as day, Thai month abbreviation and 2-digit year', () => {
    expect(formatNewsDate('2026-10-31')).toBe('31 ต.ค. 26')
    expect(formatNewsDate('2027-01-05')).toBe('5 ม.ค. 27')
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
  it('accepts a complete article and a steps payload', () => {
    expect(validateNewsPayload(base)).toBe(true)
    expect(
      validateNewsPayload({
        ...base,
        layout: 'steps',
        steps: [{ title: 'ขั้น 1', description: 'รายละเอียด', image_url: null }],
      })
    ).toBe(true)
  })

  it.each([
    ['unknown layout', { layout: 'video' }],
    ['blank title', { title: '  ' }],
    ['impossible date', { published_date: '2026-02-30' }],
    ['non-https remote image', { cover_image_url: 'http://x.test/a.png' }],
    ['non-integer order', { sort_order: 1.5 }],
    ['non-boolean published', { published: 'yes' }],
    ['step without title', { steps: [{ title: '', description: 'x', image_url: null }] }],
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
