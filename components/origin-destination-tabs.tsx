'use client'

export type OriginDestinationTab = 'origin' | 'destination'

interface OriginDestinationTabsProps {
  active: OriginDestinationTab
  onChange: (tab: OriginDestinationTab) => void
}

export function OriginDestinationTabs({ active, onChange }: OriginDestinationTabsProps) {
  return (
    <div className="grid grid-cols-2 gap-1 p-1 rounded-full border border-sage bg-white">
      <button
        type="button"
        onClick={() => onChange('origin')}
        className={`rounded-full py-2 text-sm font-medium ${
          active === 'origin' ? 'bg-foreground text-background' : 'text-zinc-500'
        }`}
      >
        ต้นทาง
      </button>
      <button
        type="button"
        onClick={() => onChange('destination')}
        className={`rounded-full py-2 text-sm font-medium ${
          active === 'destination' ? 'bg-foreground text-background' : 'text-zinc-500'
        }`}
      >
        ปลายทาง
      </button>
    </div>
  )
}
