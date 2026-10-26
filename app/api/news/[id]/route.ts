import { NextResponse } from 'next/server'
import { LineAuthError, verifyRequestAuth } from '@/lib/line-auth'
import { isNewsId, todayInBangkok } from '@/lib/news'
import { sanitizeNewsBody } from '@/lib/news-html'
import { createServiceClient } from '@/lib/supabase-server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await verifyRequestAuth(request)
    const { id } = await params
    if (!isNewsId(id)) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const supabase = createServiceClient()
    const today = todayInBangkok()
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('id', id)
      .eq('published', true)
      .or(`publish_start.is.null,publish_start.lte.${today}`)
      .or(`publish_end.is.null,publish_end.gte.${today}`)
      .maybeSingle()
    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ news: { ...data, body: sanitizeNewsBody(data.body) } })
  } catch (err) {
    if (err instanceof LineAuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 })
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
