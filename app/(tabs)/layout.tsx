import { BottomNav } from '@/components/bottom-nav'

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 pb-[calc(6rem+env(safe-area-inset-bottom))]">{children}</div>
      <BottomNav />
    </div>
  )
}
