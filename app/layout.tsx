import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finance Intelligence | Interactive Reporting Demo",
  description: "Interactive demonstration of finance reporting, deterministic automation, simulated AI assistance, role controls and configurable reports using fictitious data.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}
