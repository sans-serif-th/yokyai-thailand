'use client'

import { Suspense, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons'
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

const SWIPE_MIN_PX = 40

function SlideCarousel() {
  const [index, setIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const slide = SLIDES[index]
  const last = SLIDES.length - 1

  const go = (next: number) => setIndex(Math.min(last, Math.max(0, next)))

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(dx) >= SWIPE_MIN_PX) go(index + (dx < 0 ? 1 : -1))
  }

  return (
    <div className="flex flex-col gap-5 pb-4">
      <div
        className="relative touch-pan-y"
        onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
        onTouchEnd={handleTouchEnd}
      >
        <SlideIllustration index={index} />
        {index > 0 && (
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="สไลด์ก่อนหน้า"
            className="absolute left-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow"
          >
            <ChevronLeftIcon />
          </button>
        )}
        {index < last && (
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="สไลด์ถัดไป"
            className="absolute right-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow"
          >
            <ChevronRightIcon />
          </button>
        )}
      </div>
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
      <div className="flex justify-center">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`สไลด์ที่ ${i + 1}`}
            aria-current={i === index}
            className="flex size-8 items-center justify-center"
          >
            <span
              className={`size-2 rounded-full ${i === index ? 'bg-brand-red' : 'bg-zinc-200'}`}
            />
          </button>
        ))}
      </div>
    </div>
  )
}

// Public page — no login, no bottom nav — so the link can be shared (e.g. in
// support chat). The profile menu links here with ?from=profile, which adds
// the back arrow; a shared link has nowhere in-app to go back to.
function FaqContent() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const fromProfile = useSearchParams().get('from') === 'profile'

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-5 px-4 pb-6">
      <TopBar title="คำถามที่พบบ่อย (FAQs)" backHref={fromProfile ? '/profile' : undefined} />

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
                  <div className="flex flex-col gap-2 p-2.5 text-[14px] leading-[21px]">
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

export default function FaqPage() {
  return (
    <Suspense>
      <FaqContent />
    </Suspense>
  )
}
