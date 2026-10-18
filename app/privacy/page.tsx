import { LegalDocument } from '@/components/legal-document'
import { PRIVACY_CONTENT } from '@/lib/privacy-content'

export default async function PrivacyPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>
}) {
  // The profile menu links here with ?from=profile; the onboarding checkbox
  // opens it in a new tab, where a back arrow has nowhere sensible to go.
  const { from } = await searchParams
  return (
    <LegalDocument
      barTitle="นโยบายความเป็นส่วนตัว"
      backHref={from === 'profile' ? '/profile' : undefined}
      doc={PRIVACY_CONTENT}
    />
  )
}
