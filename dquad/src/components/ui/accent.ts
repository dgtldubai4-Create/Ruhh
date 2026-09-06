import type { Accent } from "@/lib/store/types";

export const ACCENT: Record<Accent, { bg: string; soft: string; text: string; hex: string; softHex: string }> = {
  coral: { bg: "bg-coral", soft: "bg-coral-soft", text: "text-coral", hex: "#f26b4f", softHex: "#fbd9d1" },
  sun: { bg: "bg-sun", soft: "bg-sun-soft", text: "text-[#b58a0e]", hex: "#f4c542", softHex: "#fbedbc" },
  sky: { bg: "bg-sky", soft: "bg-sky-soft", text: "text-[#2f7fb8]", hex: "#6fb6e8", softHex: "#d6e9f8" },
  berry: { bg: "bg-berry", soft: "bg-berry-soft", text: "text-berry", hex: "#b84b7a", softHex: "#f0d3e1" },
  amber: { bg: "bg-amber", soft: "bg-amber-soft", text: "text-amber", hex: "#e08a2e", softHex: "#f8e0c2" },
  mint: { bg: "bg-mint", soft: "bg-mint-soft", text: "text-[#2f8a5e]", hex: "#7fcba6", softHex: "#d9f0e4" },
  cocoa: { bg: "bg-cocoa", soft: "bg-cocoa-soft", text: "text-cocoa", hex: "#7b4a2d", softHex: "#e9d6c8" },
  grass: { bg: "bg-grass", soft: "bg-grass-soft", text: "text-grass", hex: "#2f7d3b", softHex: "#d8ebd2" },
};
