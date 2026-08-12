import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/lib/fonts";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";

/**
 * Root layout — document shell only.
 *
 * The marketing chrome (header, footer, smooth scroll) lives in the (site)
 * group, because the admin panel must not inherit any of it: a nav that
 * invites the owner to "Apply for a puppy" while they are editing a litter
 * would be absurd, and Lenis fighting a long admin form is worse.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — health-tested ${siteConfig.breed}s`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: "en_US",
    url: siteConfig.url,
    title: `${siteConfig.name} — health-tested ${siteConfig.breed}s`,
    description: siteConfig.description,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#dfe0d8",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
