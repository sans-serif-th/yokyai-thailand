// Top-right "รอบ 1 / 2570" chip beside the matching-tab page titles
// (Figma Filter/Year, node 173:3603). Display-only: a user only sees
// their own role's active round, so there's nothing to switch between.
export function RoundPill({ roundLabel }: { roundLabel: string | null }) {
  if (!roundLabel) return null
  return (
    <span className="shrink-0 rounded-lg border-2 border-brand-red bg-white px-3 py-1.5 text-xs font-bold leading-[18px] shadow-[0_0_0_3px_rgba(219,30,52,0.2)]">
      รอบ {roundLabel}
    </span>
  )
}
