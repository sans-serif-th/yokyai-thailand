'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SearchIcon, SlidersIcon, UserIcon } from './icons'

const TABS = [
  { href: '/matches', label: 'ค้นหา', Icon: SearchIcon },
  { href: '/criteria', label: 'ตั้งค่า', Icon: SlidersIcon },
  { href: '/profile', label: 'โปรไฟล์', Icon: UserIcon },
] as const

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 border-t border-sage bg-white">
      <div className="max-w-lg mx-auto flex justify-around">
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-6 py-2 text-xs ${
                active ? 'font-medium text-terracotta' : 'text-zinc-400'
              }`}
            >
              <Icon />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
