import { redirect } from 'next/navigation'

// The About + how-it-works copy moved into the FAQ page (Figma Oct update).
export default function AboutPage() {
  redirect('/faq')
}
