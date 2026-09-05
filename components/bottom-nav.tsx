'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/matches', label: 'ค้นหา', icon: '🔍' },
  { href: '/criteria', label: 'ตั้งค่า', icon: '🎯' },
  { href: '/profile', label: 'โปรไฟล์', icon: '👤' },
] as const

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 border-t border-sage bg-white">
      <div className="max-w-lg mx-auto flex justify-around">
        {TABS.map((tab) => {
          const active = pathname === tab.href
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-6 py-2 text-xs ${
                active ? 'font-medium text-terracotta' : 'text-zinc-400'
              }`}
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              {tab.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
