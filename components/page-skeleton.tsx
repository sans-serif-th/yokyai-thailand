import { TopBar } from './top-bar'

interface PageSkeletonProps {
  title: string
  backHref?: string
  centered?: boolean
  // Number of placeholder cards under the bar.
  rows?: number
}

// Shown while a page's data loads: the real fixed TopBar stays put (so a
// tab switch doesn't blank the screen) with pulsing placeholder cards.
export function PageSkeleton({ title, backHref, centered, rows = 4 }: PageSkeletonProps) {
  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-6" role="status" aria-label="กำลังโหลด">
      <TopBar title={title} backHref={backHref} centered={centered} />
      <div className="flex animate-pulse flex-col gap-3 pt-2">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-zinc-200/70" />
        ))}
      </div>
    </div>
  )
}
