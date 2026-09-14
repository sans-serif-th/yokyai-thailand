'use client'

import Image from 'next/image'
import { useState } from 'react'
import { CATEGORIES, type CategoryCode } from '@/lib/categories'
import { ShieldCheckIcon } from './icons'

interface OnboardingWelcomeProps {
  onContinue: () => void
}

// The wizard's entry screen — an illustrated 3-step explainer followed by a
// professional-category picker. Only 'teacher' is selectable today; the
// others render as disabled "เร็วๆนี้" rows so users can see where the
// product is headed without being able to pick them. Category isn't
// persisted anywhere yet (see lib/categories.ts) — this screen is purely a
// gate before the numbered steps, same role the old position quick-pick
// used to play.
export function OnboardingWelcome({ onContinue }: OnboardingWelcomeProps) {
  const [selected, setSelected] = useState<CategoryCode>('teacher')

  return (
    <div className="flex flex-col gap-5">
      {/* The illustration below already renders this same title/subtitle as
          part of the exported design, so no separate heading is added here. */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl">
        <Image src="/onboarding-intro.png" alt="" fill className="object-cover" priority />
      </div>

      <div className="flex items-center gap-2.5 rounded-xl bg-white px-4 py-3">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-red text-white">
          <ShieldCheckIcon />
        </span>
        <p className="text-xs text-zinc-600">
          เราดูแลข้อมูลของคุณด้วยมาตรฐานความปลอดภัย เพื่อให้คุณใช้งานได้อย่างมั่นใจ
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {CATEGORIES.map((c) => {
          const isSelected = selected === c.code
          return (
            <button
              key={c.code}
              type="button"
              disabled={c.comingSoon}
              onClick={() => setSelected(c.code)}
              className="flex items-center justify-between rounded-lg bg-white px-4 py-2 text-left disabled:opacity-70"
            >
              <span className="text-[14px] font-bold">{c.nameTh}</span>
              {c.comingSoon ? (
                <span className="rounded-lg bg-zinc-100 px-1.5 py-1 text-[10px] text-zinc-500">
                  เร็วๆนี้
                </span>
              ) : (
                <span
                  className={`flex size-[14px] shrink-0 items-center justify-center rounded-full border ${
                    isSelected ? 'border-brand-red' : 'border-zinc-300'
                  }`}
                >
                  {isSelected && <span className="size-2 rounded-full bg-brand-red" />}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-sage/50 bg-background p-4">
        <button
          type="button"
          onClick={onContinue}
          className="btn-brand-primary mx-auto block max-w-lg w-full"
        >
          ถัดไป
        </button>
      </div>
    </div>
  )
}
