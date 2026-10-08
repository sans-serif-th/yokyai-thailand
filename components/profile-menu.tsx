'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getLiffProfile, liffLogout } from '@/lib/liff'
import { ChevronRightIcon, LogOutIcon, PencilIcon } from './icons'
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
  label,
  href,
  external,
  onClick,
  icon,
}: {
  label: string
  href?: string
  external?: boolean
  onClick?: () => void
  icon?: React.ReactNode
}) {
  const content = (
    <>
      <span className="flex-1 text-[14px] font-bold leading-5 tracking-[0.1px]">{label}</span>
      {icon ?? <ChevronRightIcon className="size-4" />}
    </>
  )
  const rowClass = 'flex min-h-[51px] items-center gap-1 rounded-lg bg-white px-4 py-2 text-left'

  if (href && external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={rowClass}>
        {content}
      </a>
    )
  }
  if (href) {
    return (
      <Link href={href} className={rowClass}>
        {content}
      </Link>
    )
  }
  return (
    <button type="button" onClick={onClick} className={`${rowClass} w-full`}>
      {content}
    </button>
  )
}

// The โปรไฟล์ tab's landing content — a menu, not a form. Name/phone
// editing happens on the separate /profile/edit screen.
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
    <div className="mx-auto flex w-full max-w-lg flex-col gap-5 px-4 py-6">
      <h1 className="py-2 text-xl font-bold">โปรไฟล์</h1>

      <div className="flex flex-col items-center gap-2">
        <div className="size-[97px] overflow-hidden rounded-full bg-brand-red">
          {lineProfile?.pictureUrl && (
            <Image
              src={lineProfile.pictureUrl}
              alt=""
              width={97}
              height={97}
              className="h-full w-full object-cover"
              unoptimized
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          <p className="text-[18px] font-semibold leading-[27px]">
            {lineProfile?.displayName ?? teacher.display_name}
          </p>
          <Link href="/profile/edit" aria-label="แก้ไข" className="text-foreground">
            <PencilIcon className="size-[10px]" />
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-[13px]">
        <MenuRow label="เกี่ยวกับเรา / คำถามที่พบบ่อย (FAQs)" href="/faq" />
        <MenuRow label="ข้อกำหนดและเงื่อนไข" href="/terms" />
        <MenuRow label="ช่วยเหลือ" href="https://lin.ee/ZwsPm2X" external />
        <MenuRow
          label="ออกจากระบบ"
          onClick={handleLogout}
          icon={<LogOutIcon className="size-4" />}
        />
      </div>
    </div>
  )
}
