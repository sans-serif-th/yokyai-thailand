import { LegalDocument } from '@/components/legal-document'
import { PRIVACY_CONTENT } from '@/lib/privacy-content'

export default function PrivacyPage() {
  return <LegalDocument barTitle="นโยบายความเป็นส่วนตัว" doc={PRIVACY_CONTENT} />
}
