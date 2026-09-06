// รอบที่ต้องการย้าย is two separate values — round (1 or 2; สพฐ. runs two
// transfer rounds per Gregorian year) and year — kept apart rather than
// combined into one field, since a teacher picks each independently.
export const TRANSFER_ROUND_PATTERN = /^[12]$/

export interface SelectOption {
  value: string
  label: string
}

// Static (not time-dependent), so this can be imported and used directly —
// unlike the year options below, it doesn't need a useState lazy initializer.
export const TRANSFER_ROUND_OPTIONS: SelectOption[] = [
  { value: '1', label: 'รอบที่ 1' },
  { value: '2', label: 'รอบที่ 2' },
]

// Impure (reads wall-clock time), so it must only ever be called from a
// useState lazy initializer (runs once, at mount) or an event handler —
// never directly in the render body (react-hooks/purity forbids that).
export function upcomingTransferYears(): number[] {
  const currentYear = new Date().getFullYear()
  return [currentYear + 1, currentYear + 2, currentYear + 3]
}

// Rows saved before the round/year split (or before this field existed at
// all) may carry only a year — displayed as "ปี <year>" rather than the
// misleading "รอบที่ <year>".
export function formatTransferRound(round: string | null, year: number | null): string | null {
  if (round && year) return `รอบที่ ${round}/${year}`
  if (year) return `ปี ${year}`
  if (round) return `รอบที่ ${round}`
  return null
}
