import { BottomNav } from '@/components/bottom-nav'

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 pb-16">{children}</div>
      <BottomNav />
    </div>
  )
}
