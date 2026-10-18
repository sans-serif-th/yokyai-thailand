import { NextResponse } from 'next/server'
import { LineAuthError, verifyRequestAuth } from '@/lib/line-auth'
import { NEWS_SUMMARY_COLUMNS, todayInBangkok } from '@/lib/news'
import { createServiceClient } from '@/lib/supabase-server'

// Published news within its show-from/until window for the home list, in the admin-chosen order (sort_order),
// newest first within the same order.
export async function GET(request: Request) {
  try {
    await verifyRequestAuth(request)
    const supabase = createServiceClient()
    const today = todayInBangkok()
    const { data, error } = await supabase
      .from('news')
      .select(NEWS_SUMMARY_COLUMNS)
      .eq('published', true)
      // Inside the optional show-from / show-until window (inclusive).
      .or(`publish_start.is.null,publish_start.lte.${today}`)
      .or(`publish_end.is.null,publish_end.gte.${today}`)
      .order('sort_order', { ascending: true })
      .order('published_date', { ascending: false })
    if (error) throw error
    return NextResponse.json({ news: data ?? [] })
  } catch (err) {
    if (err instanceof LineAuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 })
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
