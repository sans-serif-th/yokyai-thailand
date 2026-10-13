// Display label for a teacher's subject (เอก). Stored values are free text:
// imported rows and some users already include the "เอก" prefix
// ("เอกคณิตศาสตร์"), others only the bare subject ("คณิตศาสตร์"). Strip a
// leading "เอก" before re-adding it so cards never read "เอกเอก…". A teacher
// can list several subjects separated by commas (see joinSubjects).
export function subjectLabel(subject: string): string {
  return subject
    .split(',')
    .map((s) => s.trim().replace(/^เอก\s*/, ''))
    .filter(Boolean)
    .map((s) => `เอก${s}`)
    .join(', ')
}
