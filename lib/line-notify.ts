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

export function contactNoticeText(notice: ContactNotice): string {
  const link = contactsLink()
  const tail = link ? `\n${link}` : ''
  return notice === 'request_received'
    ? `มีคำขอติดต่อใหม่ใน “โยกย้าย” เปิดดูและตอบกลับได้ที่หน้าคำขอติดต่อ${tail}`
    : `คำขอติดต่อของคุณใน “โยกย้าย” ได้รับการยอมรับแล้ว ดูชื่อและ LINE ID ได้ที่หน้าคำขอติดต่อ${tail}`
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
        messages: [{ type: 'text', text: contactNoticeText(notice) }],
      }),
    })
    if (!res.ok) {
      console.error('LINE push failed', res.status, await res.text().catch(() => ''))
    }
  } catch (err) {
    console.error('LINE push error', err)
  }
}
