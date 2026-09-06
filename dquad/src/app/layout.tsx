import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/shell/providers";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["opsz", "wdth"],
});
const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const arabic = Noto_Sans_Arabic({ subsets: ["arabic"], variable: "--font-arabic" });

export const metadata: Metadata = {
  title: { default: "Dabur Squad", template: "%s · Dabur Squad" },
  description:
    "D'QuAD prototype: a creator growth community for Dabur brand teams and creators across the UAE and KSA. Internal demo, simulated data.",
};

export const viewport: Viewport = {
  themeColor: "#F6F1E7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${display.variable} ${body.variable} ${arabic.variable}`} suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
