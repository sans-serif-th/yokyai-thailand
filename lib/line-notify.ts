// Push notifications through the LINE Official Account's Messaging API.
//
// Separate from the LINE Login channel used for sign-in (lib/line-auth.ts):
// the token is the OA's long-lived channel access token. The OA must be in the
// same provider as the Login channel so the login `userId` is valid here, and
// the recipient must have added the OA as a friend.
//
// Notifications are best-effort: they never throw, so a failed push can't make
// the action that triggered it fail. Messages are deliberately generic — no
// names or contact details leave the app through LINE.

const PUSH_URL = 'https://api.line.me/v2/bot/message/push'

export type ContactNotice = 'request_received' | 'request_accepted'

function contactsLink(): string {
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID
  return liffId ? `https://liff.line.me/${liffId}/contacts` : ''
}

const NOTICE_COPY: Record<ContactNotice, { title: string; body: string; button: string }> = {
  request_received: {
    title: 'มีคำขอติดต่อใหม่',
    body: 'มีครูส่งคำขอติดต่อถึงคุณใน “โยกย้าย” เปิดดูและเลือกตอบรับหรือปฏิเสธได้เลย',
    button: 'เปิดดูคำขอ',
  },
  request_accepted: {
    title: 'คำขอติดต่อได้รับการยอมรับ',
    body: 'คำขอติดต่อของคุณใน “โยกย้าย” ได้รับการยอมรับแล้ว ดูชื่อและ LINE ID ได้ที่หน้าคำขอติดต่อ',
    button: 'ดูข้อมูลติดต่อ',
  },
}

// Plain-text form of the notice. Used as the Flex message's altText, which is
// what LINE shows in the push banner and the chat list.
export function contactNoticeText(notice: ContactNotice): string {
  const { title, body } = NOTICE_COPY[notice]
  return `${title}: ${body}`
}

// A card with a button that opens the contacts page in LIFF. Without a LIFF id
// configured the button is omitted rather than pointing nowhere.
export function contactNoticeMessage(notice: ContactNotice) {
  const { title, body, button } = NOTICE_COPY[notice]
  const link = contactsLink()
  return {
    type: 'flex' as const,
    altText: contactNoticeText(notice),
    contents: {
      type: 'bubble',
      size: 'kilo',
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          { type: 'text', text: 'โยกย้าย', size: 'xs', color: '#df8c7c', weight: 'bold' },
          { type: 'text', text: title, size: 'lg', weight: 'bold', wrap: true },
          { type: 'text', text: body, size: 'sm', color: '#555555', wrap: true },
        ],
      },
      ...(link && {
        footer: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'button',
              style: 'primary',
              color: '#db1e34',
              action: { type: 'uri', label: button, uri: link },
            },
          ],
        },
      }),
    },
  }
}

export async function notifyContact(
  lineUserId: string | null | undefined,
  notice: ContactNotice
): Promise<void> {
  const token = process.env.LINE_MESSAGING_ACCESS_TOKEN
  if (!token || !lineUserId) return
  try {
    const res = await fetch(PUSH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        to: lineUserId,
        messages: [contactNoticeMessage(notice)],
      }),
    })
    if (!res.ok) {
      console.error('LINE push failed', res.status, await res.text().catch(() => ''))
    }
  } catch (err) {
    console.error('LINE push error', err)
  }
}
