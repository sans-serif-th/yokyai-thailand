'use client'

import { useState } from 'react'
import { TopBar } from '@/components/top-bar'
import { SLIDES, SlideIllustration } from '@/components/onboarding-welcome'
import { FAQ_ITEMS } from '@/lib/faq'

function Caret({ open }: { open: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      className={open ? 'rotate-180' : ''}
      aria-hidden
    >
      <path d="m7 10 5 5 5-5z" fill="currentColor" />
    </svg>
  )
}

function SlideCarousel() {
  const [index, setIndex] = useState(0)
  const slide = SLIDES[index]
  return (
    <div className="flex flex-col gap-5 pb-4">
      <SlideIllustration index={index} />
      <div className="flex flex-col items-center text-center">
        <p className="text-[24px] font-bold leading-tight">{slide.title}</p>
        <p className="text-[14px] leading-[21px]">
          {slide.lines.map((line, i) => (
            <span key={line}>
              {i > 0 && <br />}
              {line}
            </span>
          ))}
        </p>
      </div>
      <div className="flex justify-center gap-[3px]">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`สไลด์ที่ ${i + 1}`}
            className={`size-2 rounded-full ${i === index ? 'bg-brand-red' : 'bg-zinc-200'}`}
          />
        ))}
      </div>
    </div>
  )
}

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-5 px-4 pb-6">
      <TopBar title="คำถามที่พบบ่อย (FAQs)" backHref="/profile" />

      <div className="flex flex-col gap-2">
        {FAQ_ITEMS.map((item, i) => {
          const open = openIndex === i
          return (
            <div key={item.title} className="rounded-md bg-white px-2">
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : i)}
                aria-expanded={open}
                className="flex w-full items-center gap-2.5 py-2 text-left"
              >
                <span className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-brand-red-soft text-base font-semibold text-brand-red">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="flex-1 text-base font-semibold leading-6">{item.title}</span>
                <Caret open={open} />
              </button>
              {open &&
                (item.slides ? (
                  <SlideCarousel />
                ) : (
                  <div className="flex flex-col gap-2 p-2.5 text-xs leading-[18px]">
                    {item.qa?.map((x) => (
                      <p key={x.q}>
                        Q: {x.q}
                        <br />
                        A: {x.a}
                      </p>
                    ))}
                  </div>
                ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
