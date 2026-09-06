"use client";
import { useAppState } from "@/lib/store/hooks";
import { ACCENT } from "@/components/ui/accent";

/** One marquee on the page: the twelve brands, reversing under RTL. */
export function BrandTicker() {
  const s = useAppState();
  const items = [...s.brands, ...s.brands];
  return (
    <div className="relative z-10 border-y border-line bg-paper-2 py-4" aria-hidden>
      <div className="rail overflow-hidden">
        <div className="anim-marquee flex w-max items-center gap-10 whitespace-nowrap px-4">
          {items.map((b, i) => (
            <span key={`${b.id}-${i}`} className="flex items-center gap-3 font-display text-[17px] font-semibold text-ink/80">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: ACCENT[b.accent].hex }} />
              {b.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
