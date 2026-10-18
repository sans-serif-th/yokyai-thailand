import { redirect } from 'next/navigation'

// The contact requests now live in the "คำขอติดต่อ" tab of the matches page.
// Kept so links already sent (LINE push messages) and bookmarks still work.
export default function ContactsPage() {
  redirect('/matches?tab=contacts')
}
