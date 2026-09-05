import type { Metadata, Viewport } from "next";
import "./globals.css";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: { default: "Ruhh — Home bakery in Dubai, by Shweta", template: "%s · Ruhh" },
  description:
    "Handmade cookies, cheesecakes, tiramisu and tea cakes, baked slowly and from the heart by Shweta in Dubai. Order for delivery or pickup.",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Ruhh — Baked to perfection",
    description: "Home-baked treats with soul, delivered across Dubai.",
    type: "website",
    locale: "en_AE",
  },
  appleWebApp: { capable: true, title: "Ruhh", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#9b4b6b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- root app layout applies to every page */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
