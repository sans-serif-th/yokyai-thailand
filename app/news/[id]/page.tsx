'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ApiError, fetchNewsItem } from '@/lib/api'
import { withAuthRetry } from '@/lib/session'
import { NewsDetail } from '@/components/news-detail'
import { PageSkeleton } from '@/components/page-skeleton'
import { TopBar } from '@/components/top-bar'
import type { NewsItem } from '@/lib/news'

type State =
  | { view: 'loading' }
  | { view: 'ready'; item: NewsItem }
  | { view: 'error'; message: string; notFound: boolean }

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [state, setState] = useState<State>({ view: 'loading' })

  useEffect(() => {
    async function load() {
      try {
        const { result } = await withAuthRetry((token) => fetchNewsItem(token, id))
        setState({ view: 'ready', item: result.news })
      } catch (err) {
        setState({
          view: 'error',
          message: (err as Error).message,
          notFound: err instanceof ApiError && err.status === 404,
        })
      }
    }
    load()
  }, [id])

  if (state.view === 'loading') return <PageSkeleton title="ข่าวสาร" backHref="/home" rows={2} />

  if (state.view === 'error') {
    return (
      <div className="mx-auto w-full max-w-lg px-4">
        <TopBar title="ข่าวสาร" backHref="/home" />
        <p className="p-8 text-center text-terracotta">
          {state.notFound ? 'ไม่พบข่าวนี้' : state.message}
        </p>
      </div>
    )
  }

  return <NewsDetail item={state.item} />
}
