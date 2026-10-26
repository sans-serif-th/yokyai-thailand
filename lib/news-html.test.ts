import { describe, expect, it } from 'vitest'
import { sanitizeNewsBody, sanitizeNewsHtml } from './news-html'

describe('sanitizeNewsHtml', () => {
  it('keeps the formatting the editor produces', () => {
    const html = '<h2>หัวข้อ</h2><p>ข้อความ <strong>หนา</strong> <em>เอียง</em></p><ul><li>หนึ่ง</li></ul>'
    expect(sanitizeNewsHtml(html)).toBe(html)
  })

  it('strips scripts, event handlers and iframes', () => {
    const out = sanitizeNewsHtml(
      '<p onclick="x()">a</p><script>alert(1)</script><iframe src="https://evil"></iframe>'
    )
    expect(out).toBe('<p>a</p>')
  })

  it('drops javascript: links and forces safe link attributes', () => {
    expect(sanitizeNewsHtml('<a href="javascript:alert(1)">x</a>')).toBe('<a target="_blank" rel="noopener noreferrer">x</a>')
    expect(sanitizeNewsHtml('<a href="https://example.com">x</a>')).toBe(
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer">x</a>'
    )
  })

  it('only allows https images', () => {
    expect(sanitizeNewsHtml('<img src="https://x.test/a.png" alt="a">')).toBe('<img src="https://x.test/a.png" alt="a" />')
    expect(sanitizeNewsHtml('<img src="data:image/png;base64,AAAA">')).toBe('<img />')
    expect(sanitizeNewsHtml('<img src="javascript:alert(1)">')).toBe('<img />')
  })
})

describe('sanitizeNewsBody', () => {
  it('leaves legacy plain-text bodies alone', () => {
    const plain = 'บรรทัดแรก\n\nบรรทัดสอง < สาม'
    expect(sanitizeNewsBody(plain)).toBe(plain)
  })
  it('passes null through', () => {
    expect(sanitizeNewsBody(null)).toBeNull()
  })
})
