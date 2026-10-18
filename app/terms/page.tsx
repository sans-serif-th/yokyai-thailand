import { TopBar } from '@/components/top-bar'
import {
  TERMS_EFFECTIVE_DATE,
  TERMS_INTRO,
  TERMS_PROVIDER,
  TERMS_SECTIONS,
  TERMS_SITE,
} from '@/lib/terms-content'

export default async function TermsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>
}) {
  // See app/privacy/page.tsx for why the back arrow is conditional.
  const { from } = await searchParams
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-5 px-4 pb-8">
      <TopBar title="ข้อกำหนดและเงื่อนไข" backHref={from === 'profile' ? '/profile' : undefined} />

      <header className="flex flex-col gap-1 text-sm text-zinc-600">
        <h1 className="text-base font-semibold text-zinc-900">ข้อกำหนดและเงื่อนไขการใช้บริการ</h1>
        <p>เว็บไซต์โยกย้าย: {TERMS_SITE}</p>
        <p>ผู้ให้บริการ: {TERMS_PROVIDER}</p>
        <p>วันที่มีผลบังคับใช้: {TERMS_EFFECTIVE_DATE}</p>
      </header>

      <div className="flex flex-col gap-2 text-sm text-zinc-600">
        {TERMS_INTRO.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      {TERMS_SECTIONS.map((section) => (
        <section key={section.heading} className="flex flex-col gap-2">
          <h2 className="font-medium">{section.heading}</h2>
          {section.clauses.map((clause) => (
            <div key={clause.no || section.heading} className="flex flex-col gap-1 text-sm text-zinc-600">
              {clause.title && <h3 className="font-medium text-zinc-800">{clause.no} {clause.title}</h3>}
              {clause.paragraphs.map((p, i) => (
                <p key={p}>{!clause.title && i === 0 && clause.no ? `${clause.no} ` : ''}{p}</p>
              ))}
              {clause.items && (
                <ol className="ml-5 flex list-decimal flex-col gap-0.5">
                  {clause.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
              )}
            </div>
          ))}
        </section>
      ))}
    </div>
  )
}
