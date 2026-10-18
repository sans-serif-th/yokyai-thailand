'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchNews, fetchProfile } from '@/lib/api'
import { withAuthRetry } from '@/lib/session'
import { TopBar } from '@/components/top-bar'
import { NewsCard } from '@/components/news-card'
import type { NewsSummary } from '@/lib/news'
import { PageSkeleton } from '@/components/page-skeleton'

type View = 'loading' | 'ready' | 'error'

export default function HomePage() {
  const router = useRouter()
  const [view, setView] = useState<View>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [news, setNews] = useState<NewsSummary[]>([])

  useEffect(() => {
    async function bootstrap() {
      try {
        const { result } = await withAuthRetry(async (token) => {
          const [profile, newsList] = await Promise.all([fetchProfile(token), fetchNews(token)])
          return { profile, news: newsList.news }
        })
        if (!result.profile.teacher) {
          router.replace('/')
          return
        }
        setNews(result.news)
        setView('ready')
      } catch (err) {
        setErrorMessage((err as Error).message)
        setView('error')
      }
    }
    bootstrap()
  }, [router])

  if (view === 'loading') {
    return <PageSkeleton title="อัพเดท" />
  }

  if (view === 'error') {
    return <p className="text-center p-8 text-terracotta">{errorMessage}</p>
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-5 px-4 pb-6">
      <TopBar title="อัพเดท" />

      {news.length === 0 && <p className="py-8 text-center text-zinc-600">ยังไม่มีข่าว</p>}

      {news.map((item) => (
        <NewsCard key={item.id} item={item} />
      ))}
    </div>
  )
}
