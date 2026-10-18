import type { Teacher } from './types'

// PDPA + invite-flow safety: every display_name is masked (see maskName). A
// facebook_import row was never entered by the person it names, and the
// Facebook link is admin-only data for every row, so facebook_url is
// stripped before this ever leaves the server — contact happens only via a
// contact request (see lib/contacts.ts) or an admin-delivered invite link
// (see lib/invites.ts), never shown here.
// invite_code is stripped unconditionally (not just for imports) since no
// match result should ever carry another teacher's claim code. admin_status
// is reset to the neutral default for the same reason — it's an internal
// admin-only outreach note (see /admin's Match Coverage page) and should
// never describe someone else's profile to an end user. phone is likewise
// never shared — match cards expose no contact details at all.
// "สมชาย ใจดี" -> "ส***** ใ*****" (Figma match cards): every word keeps only
// its first character, for imported and real users alike — onboarding tells
// users their name stays private and isn't shown to others.
export function maskName(displayName: string): string {
  return displayName
    .trim()
    .split(/\s+/)
    .map((w) => `${Array.from(w)[0] ?? ''}*****`)
    .join(' ')
}

// Allow-list: only these columns of another user's row may reach a match
// result. Every other column is blanked, so a field added to `teachers` later
// is private until it is deliberately listed here (display_name is masked and
// admin_status reset separately below).
export const MATCH_VISIBLE_FIELDS: ReadonlySet<string> = new Set([
  'id',
  'position',
  'service_type',
  'origin_province',
  'origin_district',
  'origin_zone',
  'current_school',
  'teaching_group',
  'subject',
  'benefit_note',
  'transfer_round',
  'transfer_year',
  'source',
  'claimed_at',
  'category',
])

export function sanitizeForMatch(teacher: Teacher): Teacher {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(teacher)) {
    out[key] = MATCH_VISIBLE_FIELDS.has(key) ? value : null
  }
  out.display_name = maskName(teacher.display_name)
  out.admin_status = 'new'
  return out as unknown as Teacher
}
