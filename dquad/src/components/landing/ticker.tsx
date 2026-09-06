"use client";
import { useAppState } from "@/lib/store/hooks";
import { ACCENT } from "@/components/ui/accent";

/** One marquee on the page: the twelve brands, reversing under RTL. */
export function BrandTicker() {
  const s = useAppState();
  const items = [...s.brands, ...s.brands];
  return (
    <div className="relative z-10 border-y-2 border-ink bg-card py-3" aria-hidden>
      <div className="rail overflow-hidden">
        <div className="anim-marquee flex w-max items-center gap-8 whitespace-nowrap px-4">
          {items.map((b, i) => (
            <span key={`${b.id}-${i}`} className="flex items-center gap-3 font-display text-[18px] font-bold">
              <span className="inline-block h-3.5 w-3.5 rounded-[100%_0_100%_0]" style={{ background: ACCENT[b.accent].hex }} />
              {b.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
