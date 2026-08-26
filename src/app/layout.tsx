import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import type { ReactNode } from "react";
import { SiteShell } from "@/components/SiteShell";
import { SITE_NAME, SITE_TAGLINE, getSiteUrl } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${SITE_NAME} — Free Browser Tools`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_TAGLINE,
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "Urq7-yZjZBOa1c8_QhfoGBXEy4ZuTg0_HN3vD-N5cIQ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${ibmPlexMono.variable}`}>
      <body className={`${inter.className} antialiased`}>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
