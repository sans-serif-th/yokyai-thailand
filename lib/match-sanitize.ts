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

export function sanitizeForMatch(teacher: Teacher): Teacher {
  return {
    ...teacher,
    display_name: maskName(teacher.display_name),
    facebook_url: null,
    phone: null,
    line_id: null,
    invite_code: null,
    admin_status: 'new',
  }
}
