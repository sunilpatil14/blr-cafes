import type { Metadata } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import { BRAND, TAGLINE } from "@/lib/brand";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: { default: `${BRAND} | ${TAGLINE}`, template: `%s | ${BRAND}` },
  description: "Discover cafes in Bengaluru: hours, details and directions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}