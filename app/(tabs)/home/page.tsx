'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { fetchProfile } from '@/lib/api'
import { withAuthRetry } from '@/lib/session'
import { TopBar } from '@/components/top-bar'
import { NEWS } from '@/lib/news'
import { PageSkeleton } from '@/components/page-skeleton'

type View = 'loading' | 'ready' | 'error'

export default function HomePage() {
  const router = useRouter()
  const [view, setView] = useState<View>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    async function bootstrap() {
      try {
        const { result: profile } = await withAuthRetry((token) => fetchProfile(token))
        if (!profile.teacher) {
          router.replace('/')
          return
        }
        setView('ready')
      } catch (err) {
        setErrorMessage((err as Error).message)
        setView('error')
      }
    }
    bootstrap()
  }, [router])

  if (view === 'loading') {
    return <PageSkeleton title="อัพเดท" centered />
  }

  if (view === 'error') {
    return <p className="text-center p-8 text-terracotta">{errorMessage}</p>
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-5 px-4 pb-6">
      <TopBar title="อัพเดท" centered />

      {NEWS.map((item) => (
        <article key={item.id} className="flex flex-col gap-2 rounded-[10px] bg-white">
          <div className="relative aspect-[1358/1158] w-full overflow-hidden rounded-t-[10px]">
            <Image src={item.image} alt="" fill sizes="512px" className="object-cover" />
          </div>
          <div className="flex flex-col p-2">
            <div className="flex items-center gap-2">
              <h2 className="flex-1 text-sm font-semibold leading-[21px]">{item.title}</h2>
              <span className="text-xs">{item.date}</span>
            </div>
            <p className="text-xs leading-[18px]">{item.body}</p>
          </div>
        </article>
      ))}
    </div>
  )
}
