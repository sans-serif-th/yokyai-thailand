import type { Metadata, Viewport } from "next";
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

// viewport-fit=cover lets the page (and the bottom nav) extend into the
// home-indicator strip on iPhones instead of leaving a blank band under it;
// bars pinned to the bottom add env(safe-area-inset-bottom) so their buttons
// stay clear of the indicator. Zoom is off: pinch/double-tap/focus zoom broke
// the fixed top and bottom bars on iPhone (tested 31 Oct 2026).
export const viewport: Viewport = {
  viewportFit: "cover",
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${anuphan.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
