import { TopBar } from '@/components/top-bar'
import type { LegalDocumentContent } from '@/lib/legal-types'

export function LegalDocument({
  barTitle,
  doc,
}: {
  barTitle: string
  doc: LegalDocumentContent
}) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-5 px-4 pb-8">
      <TopBar title={barTitle} />

      <header className="flex flex-col gap-1 text-sm text-zinc-600">
        <h1 className="text-base font-semibold text-zinc-900">{doc.title}</h1>
        {doc.subtitle && <p>{doc.subtitle}</p>}
        {doc.meta.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </header>

      <div className="flex flex-col gap-2 text-sm text-zinc-600">
        {doc.intro.map((text) => (
          <p key={text}>{text}</p>
        ))}
      </div>

      {doc.sections.map((section) => (
        <section key={section.heading} className="flex flex-col gap-2 text-sm text-zinc-600">
          <h2 className="font-medium text-zinc-900">{section.heading}</h2>
          {section.blocks.map((block, i) => {
            switch (block.type) {
              case 'h3':
                return (
                  <h3 key={i} className="mt-1 font-medium text-zinc-800">
                    {block.text}
                  </h3>
                )
              case 'ul':
                return (
                  <ul key={i} className="ml-5 flex list-disc flex-col gap-0.5">
                    {block.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )
              case 'ol':
                return (
                  <ol key={i} className="ml-5 flex list-decimal flex-col gap-0.5">
                    {block.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ol>
                )
              default:
                return <p key={i}>{block.text}</p>
            }
          })}
        </section>
      ))}
    </div>
  )
}
