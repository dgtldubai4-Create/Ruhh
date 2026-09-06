export function fmtPoints(n: number): string {
  return new Intl.NumberFormat("en-GB").format(n);
}
export function fmtDate(iso: string, lang: "en" | "ar" = "en"): string {
  return new Intl.DateTimeFormat(lang === "ar" ? "ar-AE-u-nu-latn" : "en-GB", { day: "numeric", month: "short" }).format(new Date(iso));
}
export function fmtDateLong(iso: string, lang: "en" | "ar" = "en"): string {
  return new Intl.DateTimeFormat(lang === "ar" ? "ar-AE-u-nu-latn" : "en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
}
export function fmtDateTime(iso: string, lang: "en" | "ar" = "en"): string {
  return new Intl.DateTimeFormat(lang === "ar" ? "ar-AE-u-nu-latn" : "en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}
export function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}
export function fmtFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}
export function fmtBytes(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} MB`;
  if (n >= 1_000) return `${Math.round(n / 1_000)} KB`;
  return `${n} B`;
}
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d} d ago`;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(iso));
}
export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
