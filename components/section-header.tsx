import type { ReactNode } from 'react'

interface SectionHeaderProps {
  icon: ReactNode
  title: string
  subtitle: string
}

// Icon + title + subtitle group header, shown above a related cluster of
// form fields (e.g. "ข้อมูลตำแหน่งงาน" above ตำแหน่ง/กลุ่มสาระ/วิชาเอก).
// Shared by origin-fields.tsx, destination-fields.tsx, and the wizard's
// contact step — first introduced with the onboarding-wizard redesign.
export function SectionHeader({ icon, title, subtitle }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2.5 py-2">
      <div className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-brand-red-soft text-brand-red">
        {icon}
      </div>
      <div className="flex flex-col">
        <p className="text-base font-semibold text-foreground">{title}</p>
        <p className="text-xs text-zinc-500">{subtitle}</p>
      </div>
    </div>
  )
}
