import Image from 'next/image'
import Link from 'next/link'
import { formatNewsDate, type NewsSummary } from '@/lib/news'

// Figma home (164:3777) card: cover at 1358:1158, then title and date.
export function NewsCard({ item }: { item: NewsSummary }) {
  return (
    <Link href={`/news/${item.id}`} className="flex flex-col gap-2 overflow-hidden rounded-[10px] bg-white">
      <div className="relative aspect-[1358/1158] w-full bg-zinc-200">
        {item.cover_image_url && (
          <Image src={item.cover_image_url} alt="" fill sizes="512px" className="object-cover" />
        )}
      </div>
      <div className="flex flex-col p-2">
        <h2 className="text-sm font-semibold leading-[21px]">{item.title}</h2>
        <p className="text-xs leading-[18px]">{formatNewsDate(item.published_date)}</p>
      </div>
    </Link>
  )
}
