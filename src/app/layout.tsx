import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sip the Dip",
  description: "Track ETF dips, neutral alerts, manual investing journal, and hypothetical backtests.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
