"use client";
import { cx } from "@/lib/format";
import type { Accent, Brand } from "@/lib/store/types";
import { ACCENT } from "@/components/ui/accent";

type Shape = Brand["packShape"];

function mix(hex: string, amount: number, to: "#000000" | "#ffffff" = "#000000"): string {
  const n = parseInt(hex.slice(1), 16), t = parseInt(to.slice(1), 16);
  const ch = (s: number) => Math.round(((n >> s) & 255) * (1 - amount) + ((t >> s) & 255) * amount);
  return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, "0")}`;
}

/**
 * Product-like pack render: a lit body with a specular streak, a dark cap and a
 * paper label set in type. Not an official pack; the brand name is the only identity.
 */
export function Pack({ shape = "bottle", accent = "grass", label, sub, size = 120, className, tilt = 0 }: { shape?: Shape; accent?: Accent; label: string; sub?: string; size?: number; className?: string; tilt?: number }) {
  const a = ACCENT[accent].hex;
  const w = size;
  const h = size * 1.5;
  const body = `linear-gradient(90deg, ${mix(a, 0.55)} 0%, ${mix(a, 0.2)} 22%, ${a} 48%, ${mix(a, 0.18, "#ffffff")} 62%, ${mix(a, 0.35)} 100%)`;
  const cap = "linear-gradient(90deg, #0b0f0d 0%, #2a322d 40%, #4a534d 55%, #161b18 100%)";
  const gloss = "linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0.05) 60%, rgba(255,255,255,0))";
  const common = "absolute left-1/2 -translate-x-1/2";
  const geo: Record<Shape, { cap: [number, number, number, string]; neck?: [number, number, number, string]; body: [number, number, number, string]; label: number }> = {
    bottle: { cap: [0, 0.32, 0.14, "6px 6px 2px 2px"], neck: [0.12, 0.5, 0.08, "8px 8px 0 0"], body: [0.18, 0.86, 0.8, `${w * 0.26}px ${w * 0.26}px ${w * 0.18}px ${w * 0.18}px`], label: 0.46 },
    tube: { cap: [0, 0.36, 0.12, "5px 5px 0 0"], body: [0.11, 0.62, 0.85, `${w * 0.16}px ${w * 0.16}px 6px 6px`], label: 0.36 },
    jar: { cap: [0.08, 0.9, 0.16, `${w * 0.1}px`], body: [0.22, 0.98, 0.7, `${w * 0.16}px`], label: 0.44 },
    box: { cap: [0.14, 0.9, 0.1, "10px 10px 0 0"], body: [0.14, 0.9, 0.7, "10px"], label: 0.38 },
    sachet: { cap: [0.1, 0.78, 0.06, "0"], body: [0.1, 0.78, 0.8, "14px"], label: 0.46 },
    spray: { cap: [0, 0.5, 0.16, "10px 10px 4px 4px"], neck: [0.14, 0.34, 0.12, "0"], body: [0.24, 0.62, 0.72, `${w * 0.2}px ${w * 0.2}px ${w * 0.14}px ${w * 0.14}px`], label: 0.46 },
    carton: { cap: [0.06, 0.82, 0.12, "0"], body: [0.16, 0.82, 0.8, "6px 6px 12px 12px"], label: 0.42 },
  };
  const g = geo[shape];
  const box = (t: [number, number, number, string], bg: string, extra?: React.CSSProperties) => ({ top: h * t[0], width: w * t[1], height: h * t[2], borderRadius: t[3], background: bg, ...extra });
  return (
    <div className={cx("relative inline-block select-none", className)} style={{ width: w, height: h, transform: tilt ? `rotate(${tilt}deg)` : undefined, filter: "drop-shadow(0 18px 24px rgba(0,0,0,0.45))" }} aria-hidden>
      {/* floor reflection */}
      <span className="absolute left-1/2 -translate-x-1/2 rounded-[50%]" style={{ bottom: -h * 0.06, width: w * 0.9, height: h * 0.06, background: "rgba(0,0,0,0.55)", filter: "blur(6px)" }} />
      <span className={common} style={box(g.cap, cap, shape === "carton" ? { clipPath: "polygon(10% 100%, 50% 0, 90% 100%)" } : undefined)} />
      {g.neck && <span className={common} style={box(g.neck, body)} />}
      <span className={common} style={box(g.body, body, shape === "sachet" ? { clipPath: "polygon(4% 0, 96% 0, 100% 100%, 0 100%)" } : undefined)} />
      {/* specular streak */}
      <span className="absolute rounded-pill" style={{ top: h * (g.body[0] + 0.04), left: w * 0.22, width: w * 0.07, height: h * (g.body[2] - 0.1), background: gloss, opacity: 0.9 }} />
      {/* label */}
      <span
        className={cx(common, "flex flex-col items-center justify-center rounded-[8px] px-1 text-center")}
        style={{ top: h * g.label, width: w * 0.66, height: h * 0.24, background: "#f3efe4", boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.25)" }}
      >
        <span className="font-display font-bold leading-none" style={{ fontSize: Math.max(9, w * 0.11), color: "#0f1411" }}>{label}</span>
        {sub && <span className="mt-0.5 leading-none" style={{ fontSize: Math.max(7, w * 0.07), color: "#4c5449" }}>{sub}</span>}
      </span>
    </div>
  );
}
