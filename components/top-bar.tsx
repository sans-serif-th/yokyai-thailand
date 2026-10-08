import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowLeftIcon } from './icons'

interface TopBarProps {
  title: string
  // Shows a back arrow linking here (screens reached by navigating "into"
  // something — never the bottom-nav tab landing screens).
  backHref?: string
  right?: ReactNode
  centered?: boolean
}

// Figma's Navigation/TopBar, pinned to the top of the viewport on every
// screen. A same-height spacer follows the fixed bar so page content starts
// just below it — pages therefore use `pb-6` (no top padding) around it.
export function TopBar({ title, backHref, right, centered = false }: TopBarProps) {
  return (
    <>
      <div className="fixed inset-x-0 top-0 z-20 bg-background">
        <div className="mx-auto flex h-[72px] max-w-lg items-end gap-2 px-4 pb-2">
          {backHref && (
            <Link
              href={backHref}
              aria-label="ย้อนกลับ"
              className="flex size-10 shrink-0 items-center justify-center"
            >
              <ArrowLeftIcon />
            </Link>
          )}
          <h1 className={`flex-1 py-2 text-xl font-bold ${centered ? 'text-center' : ''}`}>
            {title}
          </h1>
          {right}
        </div>
      </div>
      <div className="h-[72px] shrink-0" aria-hidden />
    </>
  )
}
