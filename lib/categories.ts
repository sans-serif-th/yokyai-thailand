// The professional category (สายอาชีพ) picked on the welcome screen, before
// the onboarding wizard's numbered steps — distinct from lib/positions.ts
// (a role WITHIN the teacher-transfer domain, e.g. ครูผู้สอน vs
// นักจัดการงานทั่วไป, chosen later inside the origin step's own field).
// Only 'teacher' is selectable today; the others are shown disabled
// ("เร็วๆนี้") to signal where the product is headed. This mirrors (but is
// intentionally separate from) the `categories` DB table, which exists for
// FK integrity on teachers.category — that table isn't queried for this
// picker, same reference-vs-canonical split already used for
// service_types/teaching_groups.

export type CategoryCode = 'teacher' | 'nurse' | 'pharmacist'

export interface Category {
  code: CategoryCode
  nameTh: string
  comingSoon?: boolean
}

export const CATEGORIES: Category[] = [
  { code: 'teacher', nameTh: 'ครูผู้สอน' },
  { code: 'nurse', nameTh: 'พยาบาล', comingSoon: true },
  { code: 'pharmacist', nameTh: 'เภสัชกร', comingSoon: true },
]
