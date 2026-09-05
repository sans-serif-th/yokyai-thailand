'use client'

import Link from 'next/link'
import { ChevronLeftIcon } from './icons'

interface BackHeaderProps {
  title: string
  href: string
}

// Used on screens reached by navigating "into" something (e.g. the ตั้งค่า
// edit screen) — never on the bottom-nav tab landing screens themselves,
// since those have no real "back" to go to.
export function BackHeader({ title, href }: BackHeaderProps) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <Link
        href={href}
        aria-label="ย้อนกลับ"
        className="flex items-center justify-center w-10 h-10 -ml-2 text-foreground"
      >
        <ChevronLeftIcon />
      </Link>
      <h1 className="text-xl font-semibold">{title}</h1>
    </div>
  )
}
