import Image from 'next/image'
import { isHtmlBody, splitParagraphs, type NewsItem } from '@/lib/news'
import { TopBar } from './top-bar'

// Figma news detail: 191:1409. A square cover, then the body
// (HTML from the admin editor, or plain paragraphs for older news).
export function NewsDetail({ item }: { item: NewsItem }) {
  const paragraphs = splitParagraphs(item.body)

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-5 px-4 pb-6">
      <TopBar title="กลับ" backHref="/home" />

      <div className="relative aspect-square w-full bg-zinc-200">
        {item.cover_image_url && (
          <Image src={item.cover_image_url} alt="" fill sizes="512px" className="object-cover" priority />
        )}
      </div>

      {isHtmlBody(item.body) ? (
        // Sanitized server-side on save and again by /api/news/[id].
        <div className="news-html" dangerouslySetInnerHTML={{ __html: item.body ?? '' }} />
      ) : (
        <div className="flex flex-col gap-[21px] text-[14px] leading-[21px]">
          {paragraphs.map((p, i) => (
            <p key={i} className="whitespace-pre-line">
              {p}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
