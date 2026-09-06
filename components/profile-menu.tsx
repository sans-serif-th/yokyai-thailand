'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getLiffProfile, liffLogout } from '@/lib/liff'
import { ChevronRightIcon, FileTextIcon, LogOutIcon, PencilIcon, StarIcon } from './icons'
import type { Teacher } from '@/lib/types'

interface LineProfile {
  displayName: string
  pictureUrl?: string
}

interface ProfileMenuProps {
  teacher: Teacher
  onLoggedOut: () => void
}

function MenuRow({
  icon,
  label,
  href,
  onClick,
  tone = 'default',
}: {
  icon: React.ReactNode
  label: string
  href?: string
  onClick?: () => void
  tone?: 'default' | 'danger'
}) {
  const content = (
    <>
      <span
        className={`flex items-center justify-center w-9 h-9 rounded-full ${
          tone === 'danger' ? 'bg-terracotta/10 text-terracotta' : 'bg-lavender/30 text-foreground'
        }`}
      >
        {icon}
      </span>
      <span className={`flex-1 text-sm ${tone === 'danger' ? 'text-terracotta' : ''}`}>{label}</span>
      <ChevronRightIcon className="text-zinc-400" />
    </>
  )
  const rowClass = 'flex items-center gap-3 py-4 px-4 border-b border-sage last:border-0'

  if (href) {
    return (
      <Link href={href} className={rowClass}>
        {content}
      </Link>
    )
  }
  return (
    <button type="button" onClick={onClick} className={`${rowClass} w-full text-left`}>
      {content}
    </button>
  )
}

// The โปรไฟล์ tab's landing content — a menu, not a form. Name editing
// happens on the separate /profile/edit screen.
export function ProfileMenu({ teacher, onLoggedOut }: ProfileMenuProps) {
  const [lineProfile, setLineProfile] = useState<LineProfile | null>(null)

  useEffect(() => {
    let cancelled = false
    getLiffProfile()
      .then((profile) => {
        if (!cancelled) setLineProfile(profile)
      })
      .catch(() => {
        // Non-critical — the page still works without the LINE profile card.
      })
    return () => {
      cancelled = true
    }
  }, [])

  function handleLogout() {
    liffLogout()
    onLoggedOut()
  }

  return (
    <div className="flex flex-col gap-5 max-w-lg mx-auto p-4">
      <h1 className="text-xl font-semibold">โปรไฟล์</h1>

      <div className="flex items-center gap-3 card-surface">
        <div className="w-12 h-12 rounded-full bg-lavender overflow-hidden shrink-0">
          {lineProfile?.pictureUrl && (
            <Image
              src={lineProfile.pictureUrl}
              alt=""
              width={48}
              height={48}
              className="w-full h-full object-cover"
              unoptimized
            />
          )}
        </div>
        <div className="flex-1">
          <p className="text-xs text-zinc-500">บัญชี LINE</p>
          <p className="text-sm font-medium">{lineProfile?.displayName ?? teacher.display_name}</p>
        </div>
        <Link
          href="/profile/edit"
          aria-label="แก้ไข"
          className="flex items-center justify-center w-9 h-9 rounded-full text-terracotta shrink-0"
        >
          <PencilIcon />
        </Link>
      </div>

      <div className="card-surface p-0 overflow-hidden">
        <MenuRow icon={<StarIcon />} label="อัพเกรด" href="/upgrade" />
        <MenuRow icon={<FileTextIcon />} label="เกี่ยวกับเรา" href="/about" />
        <MenuRow icon={<FileTextIcon />} label="ข้อกำหนดและเงื่อนไข" href="/terms" />
        <MenuRow icon={<LogOutIcon />} label="ออกจากระบบ" onClick={handleLogout} tone="danger" />
      </div>
    </div>
  )
}
