'use client'

interface UnderlineTabsProps<T extends string> {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}

// Equal-width text filters where the active one is red and underlined —
// Figma's filter row under the ผลจับคู่ / คำขอติดต่อ switch.
export function UnderlineTabs<T extends string>({ options, value, onChange }: UnderlineTabsProps<T>) {
  return (
    <div className="flex items-center justify-between text-center text-sm font-semibold leading-[21px]">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={o.value === value}
          className={`min-w-0 flex-1 ${
            o.value === value ? 'text-brand-red underline underline-offset-2' : 'text-foreground'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
