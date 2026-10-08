import type { Metadata } from "next";
import { Anuphan } from "next/font/google";
import "./globals.css";

// Anuphan — the typeface the 2026-10 Figma update specifies for every
// screen (Thai + Latin glyphs in one family).
const anuphan = Anuphan({
  variable: "--font-anuphan",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "โยกย้าย — Teacher Position Swap",
  description: "Find a teacher who wants to mutually swap positions with you.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${anuphan.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
