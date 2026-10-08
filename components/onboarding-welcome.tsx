'use client'

import Image from 'next/image'
import { useState } from 'react'
import { CATEGORIES } from '@/lib/categories'
import { ArrowLeftIcon, CheckIcon } from './icons'

interface OnboardingWelcomeProps {
  onContinue: () => void
}

export interface Slide {
  image: string
  title: string
  lines: string[]
}

export const SLIDES: Slide[] = [
  {
    image: '/onboarding-step-1.jpg',
    title: 'กรอกข้อมูลในช่วงลงทะเบียน',
    lines: ['เพื่อยืนยันตัวตน สร้างบัญชีผู้ใช้งาน', 'กรอกต้นทางและปลายทางที่ต้องการ'],
  },
  {
    image: '/onboarding-step-2.png',
    title: 'ระบบจับคู่ข้อมูล',
    lines: ['นำข้อมูลของคุณไปจับคู่กับผู้ใช้งาน'],
  },
  {
    image: '/onboarding-step-3.png',
    title: 'ติดต่อสื่อสารกับผู้ใช้งานนอกระบบ',
    lines: ['เมื่อได้รับข้อมูลจับคู่แล้ว คุณสามารถติดต่อ', 'เพื่อพูดคุยกันนอกระบบได้โดยตรง'],
  },
]

// Shared with the FAQ page's ขั้นตอนการจับคู่ section.
export function SlideIllustration({ index }: { index: number }) {
  const slide = SLIDES[index]
  return (
    <div className="relative h-[300px] w-full shrink-0 overflow-hidden">
      {index === 0 ? (
        <>
          {/* Slide 1's source image is a square with its step badge in the
                top margin; Figma crops it to the bottom 300px and re-places
                just the badge on top, so do the same. */}
          <Image
            src={slide.image}
            alt=""
            fill
            sizes="512px"
            className="object-cover object-bottom"
            priority
          />
          <div className="absolute left-1/2 top-0 h-[50px] w-[51px] -translate-x-1/2 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element -- see above */}
            <img
              src={slide.image}
              alt=""
              className="absolute max-w-none"
              style={{
                width: '795.56%',
                height: '813.64%',
                left: '-348.31%',
                top: '-16.9%',
              }}
            />
          </div>
        </>
      ) : (
        <Image src={slide.image} alt="" fill sizes="512px" className="object-cover" priority />
      )}
    </div>
  )
}

// The wizard's entry screen — a 3-slide illustrated explainer (Figma
// "Onboarding-step-2" frames 164:3004 / 164:2957 / 164:2907) with the
// supported/coming-soon professional categories listed under each slide.
// Category isn't persisted anywhere (see lib/categories.ts) — this screen
// is purely an explainer before the numbered form steps.
export function OnboardingWelcome({ onContinue }: OnboardingWelcomeProps) {
  const [index, setIndex] = useState(0)
  const slide = SLIDES[index]
  const isLast = index === SLIDES.length - 1
  const supported = CATEGORIES.filter((c) => !c.comingSoon)
  const comingSoon = CATEGORIES.filter((c) => c.comingSoon)

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col gap-5 px-4 py-6">
      <SlideIllustration index={index} />

      <div className="flex flex-col items-center text-center">
        <h1 className="text-[24px] font-bold leading-tight">{slide.title}</h1>
        <p className="text-[14px] leading-[21px]">
          {slide.lines.map((line, i) => (
            <span key={line}>
              {i > 0 && <br />}
              {line}
            </span>
          ))}
        </p>
      </div>

      <div className="flex justify-center gap-[3px]" aria-hidden>
        {SLIDES.map((_, i) => (
          <span
            key={i}
            className={`size-2 rounded-full ${i === index ? 'bg-brand-red' : 'bg-zinc-200'}`}
          />
        ))}
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-2 px-4 py-2">
          <p className="text-[10px] font-semibold leading-[15px]">รองรับ</p>
          {supported.map((c) => (
            <div key={c.code} className="flex items-center gap-1 text-[14px] leading-[21px]">
              <span className="flex-1">{c.nameTh}</span>
              <CheckIcon className="text-[#15803d]" />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2 px-4 py-2">
          <p className="text-[10px] font-semibold leading-[15px]">เร็วๆนี้</p>
          <div className="flex flex-col gap-1">
            {comingSoon.map((c) => (
              <div key={c.code} className="flex items-center gap-1 text-[14px] leading-[21px]">
                <span className="flex-1">{c.nameTh}</span>
                <CheckIcon className="text-zinc-300" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {index > 0 && (
          <button
            type="button"
            onClick={() => setIndex(index - 1)}
            aria-label="ย้อนกลับ"
            className="flex size-10 shrink-0 items-center justify-center"
          >
            <ArrowLeftIcon />
          </button>
        )}
        <button
          type="button"
          onClick={() => (isLast ? onContinue() : setIndex(index + 1))}
          className="btn-brand-primary flex-1"
        >
          {isLast ? 'เริ่มใช้งาน' : 'ถัดไป'}
        </button>
      </div>
    </div>
  )
}
