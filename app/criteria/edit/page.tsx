import { redirect } from 'next/navigation'

// Editing now happens directly on the ตั้งค่า tab (/criteria); kept so old
// links and bookmarks still land somewhere sensible.
export default async function CriteriaEditRedirect({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  redirect(tab === 'destination' ? '/criteria?tab=destination' : '/criteria')
}
