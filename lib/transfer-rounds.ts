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

// Years are stored Gregorian (transfer_year) but shown to users as พ.ศ.
export function toBuddhistYear(gregorianYear: number): number {
  return gregorianYear + 543
}

// Combines TRANSFER_ROUND_OPTIONS x years into single "round/year" choices
// (e.g. "รอบที่ 1 / 2027") for a single dropdown — round and year are still stored
// as two separate values/columns (see profilePayloadToTeacherRow), this
// just presents them as one picker. Value uses "-" (not "/") as the
// separator so it can be split back unambiguously.
export function transferRoundYearOptions(years: number[]): SelectOption[] {
  return years.flatMap((year) =>
    TRANSFER_ROUND_OPTIONS.map((opt) => ({
      value: `${opt.value}-${year}`,
      label: `${opt.label} / ${toBuddhistYear(year)}`,
    }))
  )
}

export function parseTransferRoundYear(value: string): { round: string; year: string } {
  const [round, year] = value.split('-')
  return { round: round ?? '', year: year ?? '' }
}

// Only พ.ศ. 2570 (2027) is open for registration right now, so the picker
// offers exactly รอบที่ 1 / 2570 and รอบที่ 2 / 2570. Widen this list when
// further years open. (Kept as a function so callers' useState lazy
// initializers don't need to change.)
export function upcomingTransferYears(): number[] {
  return [2027]
}

// Rows saved before the round/year split (or before this field existed at
// all) may carry only a year — displayed as "ปี <year>" rather than the
// misleading "รอบที่ <year>".
export function formatTransferRound(round: string | null, year: number | null): string | null {
  if (round && year) return `รอบที่ ${round} / ${toBuddhistYear(year)}`
  if (year) return `ปี ${toBuddhistYear(year)}`
  if (round) return `รอบที่ ${round}`
  return null
}
