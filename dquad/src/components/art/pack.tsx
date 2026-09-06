"use client";
import { cx } from "@/lib/format";
import type { Accent, Brand } from "@/lib/store/types";
import { ACCENT } from "@/components/ui/accent";

type Shape = Brand["packShape"];

/**
 * Product-like pack illustration built from layered paper shapes.
 * Not an official pack render: the brand name is set in type on a paper label
 * so the library, campaigns and rewards feel like real products without
 * hotlinking unapproved photography.
 */
export function Pack({ shape = "bottle", accent = "grass", label, sub, size = 120, className, tilt = 0 }: { shape?: Shape; accent?: Accent; label: string; sub?: string; size?: number; className?: string; tilt?: number }) {
  const a = ACCENT[accent];
  const w = size;
  const h = size * 1.5;
  const common = "absolute left-1/2 -translate-x-1/2";
  return (
    <div className={cx("relative inline-block select-none", className)} style={{ width: w, height: h, transform: tilt ? `rotate(${tilt}deg)` : undefined }} aria-hidden>
      {shape === "bottle" && (
        <>
          <span className={common} style={{ top: 0, width: w * 0.32, height: h * 0.14, background: "var(--color-ink)", borderRadius: "6px 6px 2px 2px" }} />
          <span className={common} style={{ top: h * 0.12, width: w * 0.5, height: h * 0.08, background: a.hex, borderRadius: "8px 8px 0 0" }} />
          <span className={common} style={{ top: h * 0.18, width: w * 0.86, height: h * 0.8, background: a.hex, borderRadius: `${w * 0.26}px ${w * 0.26}px ${w * 0.18}px ${w * 0.18}px` }} />
          <span className={common} style={{ top: h * 0.3, width: w * 0.9, height: h * 0.02, background: "rgba(255,255,255,0.35)" }} />
        </>
      )}
      {shape === "tube" && (
        <>
          <span className={common} style={{ top: 0, width: w * 0.36, height: h * 0.12, background: "var(--color-ink)", borderRadius: "5px 5px 0 0" }} />
          <span className={common} style={{ top: h * 0.11, width: w * 0.62, height: h * 0.72, background: a.hex, borderRadius: `${w * 0.16}px ${w * 0.16}px 4px 4px` }} />
          <span className={common} style={{ top: h * 0.8, width: w * 0.72, height: h * 0.16, background: a.hex, clipPath: "polygon(8% 0, 92% 0, 100% 100%, 0 100%)" }} />
          <span className={common} style={{ top: h * 0.94, width: w * 0.72, height: h * 0.02, background: "var(--color-ink)" }} />
        </>
      )}
      {shape === "jar" && (
        <>
          <span className={common} style={{ top: h * 0.08, width: w * 0.9, height: h * 0.16, background: "var(--color-ink)", borderRadius: `${w * 0.1}px` }} />
          <span className={common} style={{ top: h * 0.22, width: w * 0.98, height: h * 0.7, background: a.hex, borderRadius: `${w * 0.16}px` }} />
          <span className={common} style={{ top: h * 0.3, width: w * 0.9, height: h * 0.02, background: "rgba(255,255,255,0.35)" }} />
        </>
      )}
      {shape === "box" && (
        <>
          <span className={common} style={{ top: h * 0.14, width: w * 0.9, height: h * 0.7, background: a.hex, borderRadius: 10 }} />
          <span className={common} style={{ top: h * 0.14, width: w * 0.9, height: h * 0.1, background: "var(--color-ink)", borderRadius: "10px 10px 0 0" }} />
        </>
      )}
      {shape === "sachet" && (
        <>
          <span className={common} style={{ top: h * 0.1, width: w * 0.78, height: h * 0.8, background: a.hex, borderRadius: 14, clipPath: "polygon(4% 0, 96% 0, 100% 100%, 0 100%)" }} />
          <span className={common} style={{ top: h * 0.1, width: w * 0.78, height: h * 0.06, background: "var(--color-ink)" }} />
        </>
      )}
      {shape === "spray" && (
        <>
          <span className={common} style={{ top: 0, width: w * 0.5, height: h * 0.16, background: "var(--color-ink)", borderRadius: "10px 10px 4px 4px", marginLeft: w * 0.08 }} />
          <span className={common} style={{ top: h * 0.14, width: w * 0.34, height: h * 0.12, background: a.hex }} />
          <span className={common} style={{ top: h * 0.24, width: w * 0.62, height: h * 0.72, background: a.hex, borderRadius: `${w * 0.2}px ${w * 0.2}px ${w * 0.14}px ${w * 0.14}px` }} />
        </>
      )}
      {shape === "carton" && (
        <>
          <span className={common} style={{ top: h * 0.06, width: w * 0.82, height: h * 0.12, background: "var(--color-ink)", clipPath: "polygon(10% 100%, 50% 0, 90% 100%)" }} />
          <span className={common} style={{ top: h * 0.16, width: w * 0.82, height: h * 0.8, background: a.hex, borderRadius: "6px 6px 12px 12px" }} />
        </>
      )}
      {/* paper label */}
      <span
        className={cx(common, "flex flex-col items-center justify-center rounded-[10px] bg-card px-1 text-center")}
        style={{ top: h * (shape === "tube" ? 0.36 : shape === "jar" ? 0.44 : shape === "carton" ? 0.42 : shape === "box" ? 0.38 : 0.46), width: w * 0.66, height: h * 0.24, border: `2px solid ${a.hex}` }}
      >
        <span className="font-display font-bold leading-none text-ink" style={{ fontSize: Math.max(9, w * 0.11) }}>{label}</span>
        {sub && <span className="mt-0.5 leading-none text-stone" style={{ fontSize: Math.max(7, w * 0.07) }}>{sub}</span>}
      </span>
    </div>
  );
}
