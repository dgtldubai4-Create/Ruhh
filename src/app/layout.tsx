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
      <body>{children}</body>
    </html>
  );
}
