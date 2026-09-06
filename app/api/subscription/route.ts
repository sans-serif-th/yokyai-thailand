import { NextResponse } from 'next/server'
import { LineAuthError, verifyRequestAuth } from '@/lib/line-auth'
import { getSubscriptionStatusFor, recordSlipUpload } from '@/lib/rounds'
import { createServiceClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  try {
    const auth = await verifyRequestAuth(request)
    const status = await getSubscriptionStatusFor(auth.sub)
    return NextResponse.json(status)
  } catch (err) {
    if (err instanceof LineAuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 })
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

const MAX_SLIP_BYTES = 5 * 1024 * 1024 // 5MB
const ALLOWED_SLIP_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
}

function parseDataUrl(dataUrl: unknown): { contentType: string; bytes: Uint8Array } | null {
  if (typeof dataUrl !== 'string') return null
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (!match) return null
  const [, contentType, base64] = match
  if (!ALLOWED_SLIP_TYPES[contentType]) return null
  const bytes = Buffer.from(base64, 'base64')
  if (bytes.byteLength > MAX_SLIP_BYTES) return null
  return { contentType, bytes }
}

// Uploads a payment slip image (JPEG/PNG, base64 data URL) and marks the
// caller's active-round subscription as pending ('paid', unverified) — an
// admin verifies it manually via the Supabase dashboard.
export async function POST(request: Request) {
  try {
    const auth = await verifyRequestAuth(request)
    const body = await request.json()
    const parsed = parseDataUrl((body as { slip?: unknown }).slip)
    if (!parsed) {
      return NextResponse.json(
        { error: 'ไฟล์สลิปต้องเป็น JPG หรือ PNG ขนาดไม่เกิน 5MB' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()
    const path = `${auth.sub}/${Date.now()}.${ALLOWED_SLIP_TYPES[parsed.contentType]}`
    const { error: uploadError } = await supabase.storage
      .from('payment-slips')
      .upload(path, parsed.bytes, { contentType: parsed.contentType, upsert: false })
    if (uploadError) throw uploadError

    await recordSlipUpload(auth.sub, path)

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof LineAuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 })
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
