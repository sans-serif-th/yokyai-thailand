import type { FavoriteRound } from '@/lib/types'

// The "รอบ 1 / 2570" chip as a switch (Figma Filter/Year, node 205:2242): same
// look as RoundPill plus a chevron. A native <select> sits invisibly over the
// chip, so the OS picker handles the choice.
export function RoundSelect({
  rounds,
  value,
  onChange,
  disabled = false,
}: {
  rounds: FavoriteRound[]
  value: string
  onChange: (roundId: string) => void
  disabled?: boolean
}) {
  const current = rounds.find((r) => r.id === value)
  if (!current) return null
  return (
    <label className="relative flex shrink-0 items-center gap-[5px] rounded-lg border-2 border-brand-red bg-white px-3 py-1.5 text-xs font-bold leading-[18px] shadow-[0_0_0_3px_rgba(219,30,52,0.2)]">
      <span>รอบ {current.label}</span>
      <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="m6 9 6 6 6-6" />
      </svg>
      <select
        aria-label="เลือกรอบ"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 size-full cursor-pointer opacity-0"
      >
        {rounds.map((r) => (
          <option key={r.id} value={r.id}>
            รอบ {r.label}
            {r.isActive ? ' (ปัจจุบัน)' : ''}
          </option>
        ))}
      </select>
    </label>
  )
}
