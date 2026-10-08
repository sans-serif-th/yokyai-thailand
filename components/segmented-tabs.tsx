'use client'

interface SegmentedTabsProps<T extends string> {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  // 14px semibold (breakdown tabs) vs 16px bold (match-list tabs) per Figma.
  compact?: boolean
}

// Row of equal-width white buttons where the active one turns brand red —
// Figma's tab-style "Button" rows on the matching screens.
export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
  compact = false,
}: SegmentedTabsProps<T>) {
  return (
    <div className="flex gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={o.value === value}
          className={`h-[45px] min-w-0 flex-1 whitespace-nowrap rounded-lg px-2 ${
            compact ? 'text-sm font-semibold' : 'text-base font-bold'
          } ${o.value === value ? 'bg-brand-red text-white' : 'bg-white text-foreground'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
