import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finance Intelligence | Enterprise Agent Demonstration",
  description: "Interactive, synthetic finance automation and agent-governance proof of concept by SC-Analytics.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}
