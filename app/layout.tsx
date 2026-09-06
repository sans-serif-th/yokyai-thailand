import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import "./globals.css";

// Sarabun — the standard Thai typeface, used across Thai government sites
// and forms. Matches the Figma design (which nominally uses Outfit/Manrope
// from an unrelated template, but those cover no Thai glyphs at all — Figma
// silently falls back for them, so Sarabun is what the design actually
// reads as for this app's all-Thai content).
const sarabun = Sarabun({
  variable: "--font-sarabun",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "โยกย้าย — Teacher Position Swap",
  description: "Find a teacher who wants to mutually swap positions with you.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${sarabun.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
