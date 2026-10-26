import Image from 'next/image'
import { splitParagraphs, type NewsItem } from '@/lib/news'
import { TopBar } from './top-bar'

function StepCard({
  index,
  step,
}: {
  index: number
  step: NewsItem['steps'][number]
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="relative h-[300px] w-full bg-white">
        {step.image_url && (
          <Image src={step.image_url} alt="" fill sizes="512px" className="object-contain" />
        )}
        <span className="absolute left-1/2 top-0 flex size-[50px] -translate-x-1/2 items-center justify-center rounded-full bg-brand-red text-2xl font-bold text-white">
          {index + 1}
        </span>
      </div>
      <div className="flex flex-col items-center text-center">
        <h3 className="text-2xl font-bold">{step.title}</h3>
        {step.description && (
          <p className="whitespace-pre-line text-sm leading-[21px]">{step.description}</p>
        )}
      </div>
    </div>
  )
}

// Figma news detail: 191:1409 (article) and 191:1373 (steps). Both open with
// a square cover; `layout` picks what follows it.
export function NewsDetail({ item }: { item: NewsItem }) {
  const paragraphs = splitParagraphs(item.body)

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-5 px-4 pb-6">
      <TopBar title={item.title} backHref="/home" />

      <div className="relative aspect-square w-full bg-zinc-200">
        {item.cover_image_url && (
          <Image src={item.cover_image_url} alt="" fill sizes="512px" className="object-cover" priority />
        )}
      </div>

      {item.layout === 'steps' ? (
        <>
          {item.heading && (
            <h2 className="p-[10px] text-center text-xl font-bold">{item.heading}</h2>
          )}
          {item.steps.map((step, i) => (
            <StepCard key={i} index={i} step={step} />
          ))}
        </>
      ) : (
        <>
          {item.heading && (
            <h2 className="whitespace-pre-line text-[18px] font-semibold leading-[27px]">{item.heading}</h2>
          )}
          <div className="flex flex-col gap-[18px] text-[14px] leading-[21px]">
            {paragraphs.map((p, i) => (
              <p key={i} className="whitespace-pre-line">
                {p}
              </p>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
