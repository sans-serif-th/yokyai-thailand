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

// Matches Figma's floating, icon-only pill nav. Labels are dropped visually
// (per the design — see bb90303's precedent of favoring Figma's icon-only
// treatment over an added text label) but kept as aria-label so each tab
// stays identifiable without sight.
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
    <nav className="fixed bottom-0 inset-x-0 px-4 pb-4">
      <div className="max-w-lg mx-auto bg-white border border-black/5 rounded-full p-2 flex items-center justify-center gap-1 shadow-sm">
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname === href
          const disabled = href === '/favorites' && inMatchingPhase === false

          if (disabled) {
            return (
              <span
                key={href}
                aria-label={`${label} — ใช้งานได้เมื่อเปิดช่วงจับคู่แล้ว`}
                title="ใช้งานได้เมื่อเปิดช่วงจับคู่แล้ว"
                className="flex items-center justify-center size-11 rounded-full shrink-0 text-zinc-300 cursor-not-allowed"
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
              className={`flex items-center justify-center size-11 rounded-full shrink-0 ${
                active ? 'bg-black/5 text-foreground' : 'text-zinc-400'
              }`}
            >
              <Icon />
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
