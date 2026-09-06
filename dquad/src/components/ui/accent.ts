import type { Accent } from "@/lib/store/types";

/* Accent hues plus their dark-surface tints. `soft` is a Tailwind class, `softHex` the same tint for inline styles. */
export const ACCENT: Record<Accent, { bg: string; soft: string; text: string; hex: string; softHex: string }> = {
  coral: { bg: "bg-coral", soft: "bg-coral-soft", text: "text-coral", hex: "#f0745a", softHex: "rgba(240,116,90,0.18)" },
  sun: { bg: "bg-sun", soft: "bg-sun-soft", text: "text-sun", hex: "#f2c651", softHex: "rgba(242,198,81,0.18)" },
  sky: { bg: "bg-sky", soft: "bg-sky-soft", text: "text-sky", hex: "#6fb6e8", softHex: "rgba(111,182,232,0.18)" },
  berry: { bg: "bg-berry", soft: "bg-berry-soft", text: "text-berry", hex: "#c85a8c", softHex: "rgba(200,90,140,0.18)" },
  amber: { bg: "bg-amber", soft: "bg-amber-soft", text: "text-amber", hex: "#e0953f", softHex: "rgba(224,149,63,0.18)" },
  mint: { bg: "bg-mint", soft: "bg-mint-soft", text: "text-mint", hex: "#7fcba6", softHex: "rgba(127,203,166,0.18)" },
  cocoa: { bg: "bg-cocoa", soft: "bg-cocoa-soft", text: "text-cocoa", hex: "#b07a55", softHex: "rgba(176,122,85,0.2)" },
  grass: { bg: "bg-grass", soft: "bg-grass-soft", text: "text-grass", hex: "#46b257", softHex: "rgba(70,178,87,0.16)" },
};
