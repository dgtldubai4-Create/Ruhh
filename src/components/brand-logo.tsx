import { Photo } from "@/components/photo";

/**
 * Customer-facing logo. Uses the uploaded logo from Settings when present,
 * otherwise the Ruhh wordmark lockup shipped with the app.
 */
export function BrandLogo({ url, height = 44 }: { url: string | null; height?: number }) {
  if (url) {
    return <Photo src={url} alt="Ruhh" width={height * 3} height={height} className="w-auto object-contain" style={{ height }} priority />;
  }
  return <Photo src="/brand/ruhh-lockup.svg" alt="Ruhh — baked to perfection, est. 2019" width={Math.round(height * 3.4)} height={height} style={{ height, width: "auto" }} priority />;
}

export function Monogram({ size = 36 }: { size?: number }) {
  return <Photo src="/brand/ruhh-monogram.svg" alt="Ruhh" width={size} height={size} className="rounded-full bg-cream" />;
}
