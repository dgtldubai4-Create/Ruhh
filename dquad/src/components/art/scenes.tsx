"use client";
import { cx } from "@/lib/format";
import { ACCENT } from "@/components/ui/accent";
import type { Accent } from "@/lib/store/types";
import { ART } from "./manifest";
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

/** Layered paper shapes: hills, sun, leaves. Composed, not drawn as icon paths. */
export function PaperScene({ accent = "sun", className }: { accent?: Accent; className?: string }) {
  const a = ACCENT[accent];
  return (
    <div className={cx("relative h-full w-full overflow-hidden bg-paper-2", className)} aria-hidden>
      <span className="absolute rounded-full" style={{ width: "34%", paddingTop: "34%", top: "8%", right: "10%", background: a.hex }} />
      <span className="absolute rounded-full" style={{ width: "24%", paddingTop: "24%", top: "13%", right: "15%", background: a.softHex }} />
      <span className="absolute rounded-[50%]" style={{ width: "120%", height: "60%", bottom: "-20%", left: "-30%", background: "var(--color-grass-soft)" }} />
      <span className="absolute rounded-[50%]" style={{ width: "100%", height: "50%", bottom: "-22%", left: "20%", background: "var(--color-grass)" }} />
      <span className="absolute rounded-[50%]" style={{ width: "90%", height: "40%", bottom: "-18%", left: "-20%", background: "var(--color-grass-deep)" }} />
      <Leaf className="absolute" style={{ width: "18%", left: "12%", bottom: "26%", transform: "rotate(-30deg)" }} color="var(--color-grass)" />
      <Leaf className="absolute" style={{ width: "12%", left: "30%", bottom: "34%", transform: "rotate(20deg)" }} color="var(--color-mint)" />
      <Leaf className="absolute" style={{ width: "14%", right: "28%", bottom: "30%", transform: "rotate(-10deg)" }} color="var(--color-grass-deep)" />
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
        <span className="backface-hidden absolute inset-0 flex items-center justify-center rounded-full bg-sun font-display font-bold text-ink" style={{ boxShadow: "inset 0 0 0 4px var(--color-ink)", fontSize: size * 0.4 }}>
          D
        </span>
        <span className="backface-hidden absolute inset-0 flex items-center justify-center rounded-full bg-amber font-display font-bold text-ink" style={{ transform: "rotateY(180deg)", boxShadow: "inset 0 0 0 4px var(--color-ink)", fontSize: size * 0.32 }}>
          +
        </span>
      </span>
    </span>
  );
}

/** Playful paper sticker with a hard offset, for small labels on cards. */
export function Sticker({ children, accent = "sun", className, rotate = -4 }: { children: React.ReactNode; accent?: Accent; className?: string; rotate?: number }) {
  const a = ACCENT[accent];
  return (
    <span
      className={cx("inline-flex items-center gap-1 rounded-pill border-2 border-ink px-3 py-1 font-display text-[13px] font-bold text-ink", className)}
      style={{ background: a.hex, transform: `rotate(${rotate}deg)`, boxShadow: "3px 3px 0 0 var(--color-ink)" }}
    >
      {children}
    </span>
  );
}
