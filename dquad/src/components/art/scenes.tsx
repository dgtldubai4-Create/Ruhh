"use client";
import { cx } from "@/lib/format";
import { ACCENT } from "@/components/ui/accent";
import type { Accent } from "@/lib/store/types";
import { ART } from "./manifest";
import { Pack } from "./pack";
import { useEffect, useRef, useState } from "react";

/**
 * Generated illustration with a paper-cut CSS fallback. Illustrations are
 * AI-generated paper-cut art hosted on Porter's asset host; when the file
 * is unavailable the composed fallback keeps the layout intact.
 */
export function Art({ id, alt, className, fallback, priority }: { id: keyof typeof ART; alt: string; className?: string; fallback?: React.ReactNode; priority?: boolean }) {
  const src = ART[id];
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  // Server-rendered images can fail before React attaches onError; check once after mount.
  useEffect(() => {
    const el = ref.current;
    if (el && el.complete && el.naturalWidth === 0) setFailed(true);
  }, []);
  if (!src || failed) return <div className={cx("relative overflow-hidden", className)}>{fallback ?? <PaperScene />}</div>;
  return (
    <div className={cx("relative overflow-hidden", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- remote generated asset, browser-loaded so the preview works without server fetch */}
      <img ref={ref} src={src} alt={alt} className="h-full w-full object-cover" loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : undefined} onError={() => setFailed(true)} />
    </div>
  );
}

/**
 * Studio scene: a single warm spotlight on a near-black set with a lit product
 * render in the beam. Used wherever a photographic moment has not loaded.
 */
export function PaperScene({ accent = "grass", className, shape = "bottle", label, sub }: { accent?: Accent; className?: string; shape?: "bottle" | "tube" | "jar" | "box" | "sachet" | "spray" | "carton"; label?: string; sub?: string }) {
  const a = ACCENT[accent];
  return (
    <div className={cx("relative flex h-full w-full items-end justify-center overflow-hidden", className)} style={{ background: "#0b0f0d" }} aria-hidden>
      <span className="absolute inset-0" style={{ background: `radial-gradient(ellipse 60% 70% at 50% 20%, ${a.hex}33 0%, rgba(11,15,13,0) 60%)` }} />
      <span className="absolute inset-x-0 bottom-0 h-[38%]" style={{ background: "linear-gradient(180deg, rgba(11,15,13,0) 0%, #0b0f0d 100%)" }} />
      <span className="absolute left-1/2 top-[8%] h-[70%] w-[46%] -translate-x-1/2" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(243,239,228,0.14) 0%, rgba(243,239,228,0) 65%)" }} />
      <span className="absolute left-1/2 bottom-[16%] h-[8%] w-[60%] -translate-x-1/2 rounded-[50%]" style={{ background: `radial-gradient(ellipse at center, ${a.hex}40, rgba(0,0,0,0) 70%)` }} />
      <div className="relative mb-[16%] scale-[1.15]"><Pack shape={shape} accent={accent} label={label ?? "Dabur"} sub={sub} size={110} /></div>
    </div>
  );
}

export function Leaf({ className, style, color = "var(--color-grass)" }: { className?: string; style?: React.CSSProperties; color?: string }) {
  return (
    <span className={cx("block", className)} style={{ ...style, aspectRatio: "1 / 1" }} aria-hidden>
      <span className="block h-full w-full rounded-[100%_0_100%_0]" style={{ background: color }} />
    </span>
  );
}

export function Blob({ className, style, color }: { className?: string; style?: React.CSSProperties; color: string }) {
  return <span className={cx("block rounded-[60%_40%_55%_45%/50%_60%_40%_50%]", className)} style={{ background: color, ...style }} aria-hidden />;
}

/** Spinning 3D points coin. Two faces, CSS transforms only. */
export function PointsCoin({ size = 64, className, spin = true }: { size?: number; className?: string; spin?: boolean }) {
  return (
    <span className={cx("perspective inline-block", className)} style={{ width: size, height: size }} aria-hidden>
      <span className={cx("preserve-3d relative block h-full w-full", spin && "anim-coin")}>
        <span className="backface-hidden absolute inset-0 flex items-center justify-center rounded-full bg-sun font-display font-bold text-ink" style={{ boxShadow: "inset 0 0 0 3px rgba(15,20,17,0.6), 0 8px 18px rgba(0,0,0,0.45)", fontSize: size * 0.4, color: "#0f1411" }}>
          D
        </span>
        <span className="backface-hidden absolute inset-0 flex items-center justify-center rounded-full bg-amber font-display font-bold text-ink" style={{ transform: "rotateY(180deg)", boxShadow: "inset 0 0 0 3px rgba(15,20,17,0.6), 0 8px 18px rgba(0,0,0,0.45)", fontSize: size * 0.32, color: "#0f1411" }}>
          +
        </span>
      </span>
    </span>
  );
}

/** Accent chip for small callouts on cards. */
export function Sticker({ children, accent = "sun", className, rotate = -3 }: { children: React.ReactNode; accent?: Accent; className?: string; rotate?: number }) {
  const a = ACCENT[accent];
  return (
    <span
      className={cx("inline-flex items-center gap-1 rounded-pill px-3 py-1 font-display text-[13px] font-bold", className)}
      style={{ background: a.hex, color: "#0f1411", transform: `rotate(${rotate}deg)` }}
    >
      {children}
    </span>
  );
}
