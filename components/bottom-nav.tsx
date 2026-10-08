'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { fetchRoundPhase } from '@/lib/api'
import { withAuthRetry } from '@/lib/session'
import { HeartIcon, HomeIcon, SearchIcon, SlidersIcon, UserIcon } from './icons'

const TABS = [
  { href: '/home', label: 'หน้าแรก', Icon: HomeIcon },
  { href: '/matches', label: 'ค้นหา', Icon: SearchIcon },
  { href: '/favorites', label: 'รายการโปรด', Icon: HeartIcon },
  { href: '/criteria', label: 'ตั้งค่า', Icon: SlidersIcon },
  { href: '/profile', label: 'โปรไฟล์', Icon: UserIcon },
] as const

// Matches Figma's full-width, rounded-top, icon-only bar with a red
// underline on the active tab. Labels are dropped visually but kept as
// aria-label so each tab stays identifiable without sight.
export function BottomNav() {
  const pathname = usePathname()
  // null = not yet known — treated as usable so the tab doesn't flash
  // disabled-then-enabled in the common (matching-phase) case. รายการโปรด
  // has nothing useful to show before the active round reaches its
  // matching phase (see components/registration-breakdown.tsx) — it just
  // repeats the same dashboard ค้นหา already shows — so it's disabled
  // instead of linking to a redundant page.
  const [inMatchingPhase, setInMatchingPhase] = useState<boolean | null>(null)

  useEffect(() => {
    withAuthRetry((token) => fetchRoundPhase(token))
      .then(({ result }) => setInMatchingPhase(result.inMatchingPhase))
      .catch(() => setInMatchingPhase(null))
  }, [])

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 rounded-t-[30px] bg-white shadow-[0_4px_4px_rgba(0,0,0,0.04)]">
      <div className="mx-auto flex h-[88px] max-w-lg items-start justify-center gap-[49px] px-[46px] pt-[23px]">
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname === href
          const disabled = href === '/favorites' && inMatchingPhase === false

          if (disabled) {
            return (
              <span
                key={href}
                aria-label={`${label} — ใช้งานได้เมื่อเปิดช่วงจับคู่แล้ว`}
                title="ใช้งานได้เมื่อเปิดช่วงจับคู่แล้ว"
                className="flex h-[37px] shrink-0 cursor-not-allowed flex-col items-center gap-[10px] text-zinc-300"
              >
                <Icon />
              </span>
            )
          }

          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className={`flex h-[37px] shrink-0 flex-col items-center gap-[10px] ${
                active ? 'text-brand-red' : 'text-zinc-600'
              }`}
            >
              <Icon />
              {active && <span className="h-[3px] w-[22px] rounded-full bg-brand-red" />}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
