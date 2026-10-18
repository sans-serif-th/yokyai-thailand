'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getLiffProfile, isLiffInClient, liffLogout } from '@/lib/liff'
import { TopBar } from './top-bar'
import { CheckIcon, ChevronRightIcon, CopyIcon, LogOutIcon, PencilIcon } from './icons'
import type { Teacher } from '@/lib/types'

interface LineProfile {
  displayName: string
  pictureUrl?: string
}

interface ProfileMenuProps {
  teacher: Teacher
  onLoggedOut: () => void
}

// Shows only the first 4 characters ("3f2a-xx.xxx"); the copy button still
// copies the full ID.
function maskId(id: string): string {
  return `${id.slice(0, 4)}-xx.xxx`
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
  // Logging out only makes sense in an external browser — see isLiffInClient.
  const [canLogout, setCanLogout] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    try {
      setCanLogout(!isLiffInClient())
    } catch {
      setCanLogout(false)
    }
  }, [])

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

  async function handleCopyId() {
    try {
      await navigator.clipboard.writeText(teacher.id)
    } catch {
      // Clipboard API needs a secure context / permission — fall back to a
      // temporary textarea + execCommand (works inside the LINE browser).
      const el = document.createElement('textarea')
      el.value = teacher.id
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleLogout() {
    liffLogout()
    onLoggedOut()
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-5 px-4 pb-6">
      <TopBar title="โปรไฟล์" />

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
            {teacher.display_name}
          </p>
          <Link href="/profile/edit" aria-label="แก้ไข" className="text-foreground">
            <PencilIcon className="size-[10px]" />
          </Link>
        </div>
        <div className="flex items-center gap-1 text-[12px] leading-[18px] text-zinc-500">
          <span>ID: </span>
          <span className="font-mono">{maskId(teacher.id)}</span>
          <button
            type="button"
            onClick={handleCopyId}
            aria-label="คัดลอก ID"
            className="flex size-7 shrink-0 items-center justify-center rounded-full text-foreground"
          >
            {copied ? <CheckIcon className="text-[#15803d]" /> : <CopyIcon />}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-[13px]">
        <MenuRow label="เกี่ยวกับเรา / คำถามที่พบบ่อย (FAQs)" href="/faq?from=profile" />
        <MenuRow label="ข้อกำหนดและเงื่อนไข" href="/terms?from=profile" />
        <MenuRow label="นโยบายความเป็นส่วนตัว" href="/privacy?from=profile" />
        <MenuRow label="ติดต่อ LINE OA" href="https://lin.ee/ZwsPm2X" external />
        {canLogout && (
          <MenuRow
            label="ออกจากระบบ"
            onClick={handleLogout}
            icon={<LogOutIcon className="size-4" />}
          />
        )}
      </div>
    </div>
  )
}
