import { afterEach, describe, expect, it, vi } from 'vitest'
import { contactNoticeMessage, contactNoticeText } from './line-notify'

afterEach(() => vi.unstubAllEnvs())

describe('contactNoticeMessage', () => {
  it('builds a flex card whose button opens the contacts page in LIFF', () => {
    vi.stubEnv('NEXT_PUBLIC_LIFF_ID', '123-abc')
    const msg = contactNoticeMessage('request_received')
    expect(msg.type).toBe('flex')
    expect(msg.altText).toBe(contactNoticeText('request_received'))
    const footer = (msg.contents as { footer?: { contents: { action: { uri: string } }[] } }).footer
    expect(footer?.contents[0].action.uri).toBe('https://liff.line.me/123-abc/contacts')
  })

  it('omits the button when no LIFF id is configured', () => {
    vi.stubEnv('NEXT_PUBLIC_LIFF_ID', '')
    expect(contactNoticeMessage('request_accepted').contents).not.toHaveProperty('footer')
  })

  it('uses different copy for received and accepted', () => {
    expect(contactNoticeText('request_received')).not.toBe(contactNoticeText('request_accepted'))
  })
})
