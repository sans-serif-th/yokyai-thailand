// รอบที่ต้องการย้าย is stored as "<round>/<year>" (e.g. "1/2027"), matching
// how ครู actually refer to it — สพฐ. runs two transfer rounds per (Gregorian)
// year. Informational only, not used for matching (see schema.sql).
export const TRANSFER_ROUND_PATTERN = /^[12]\/\d{4}$/

export interface TransferRoundOption {
  value: string
  label: string
}

// Impure (reads wall-clock time), so it must only ever be called from a
// useState lazy initializer (runs once, at mount) or an event handler —
// never directly in the render body (react-hooks/purity forbids that).
export function upcomingTransferRoundOptions(): TransferRoundOption[] {
  const currentYear = new Date().getFullYear()
  const years = [currentYear + 1, currentYear + 2, currentYear + 3]
  return years.flatMap((year) =>
    ([1, 2] as const).map((round) => ({
      value: `${round}/${year}`,
      label: `รอบที่ ${round}/${year}`,
    }))
  )
}

// Legacy rows created before this field carried a round (a plain year, e.g.
// "2027") fall back to "ปี <value>" rather than the misleading "รอบที่ 2027".
export function formatTransferRound(value: string | null): string | null {
  if (!value) return null
  return TRANSFER_ROUND_PATTERN.test(value) ? `รอบที่ ${value}` : `ปี ${value}`
}
