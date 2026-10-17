export type LegalBlock =
  | { type: 'p'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }

export interface LegalSection {
  heading: string
  blocks: LegalBlock[]
}

export interface LegalDocumentContent {
  title: string
  subtitle?: string
  meta: string[]
  intro: string[]
  sections: LegalSection[]
}

export const p = (text: string): LegalBlock => ({ type: 'p', text })
export const h3 = (text: string): LegalBlock => ({ type: 'h3', text })
export const ul = (...items: string[]): LegalBlock => ({ type: 'ul', items })
export const ol = (...items: string[]): LegalBlock => ({ type: 'ol', items })
