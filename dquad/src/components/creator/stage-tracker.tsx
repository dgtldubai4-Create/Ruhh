"use client";
import { Check, Minus } from "@phosphor-icons/react";
import { cx } from "@/lib/format";
import { ACCENT } from "@/components/ui/accent";
import type { Accent } from "@/lib/store/types";
import { JOURNEY_STEPS, type Journey } from "./helpers";

/**
 * Horizontal campaign journey: Invited > Brief > Script > Upload > Feedback >
 * Publish > Verified > Points released. Scrolls sideways on small screens.
 */
export function StageTracker({ journey, accent = "grass" }: { journey: Journey; accent?: Accent }) {
  const a = ACCENT[accent];
  return (
    <ol className="rail -mx-5 flex snap-x gap-0 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0" aria-label="Campaign journey">
      {JOURNEY_STEPS.map((label, i) => {
        const done = i < journey.current;
        const active = i === journey.current;
        const skipped = i === 2 && journey.scriptSkipped;
        const optional = i === 2;
        const last = i === JOURNEY_STEPS.length - 1;
        return (
          <li key={label} className="flex min-w-[112px] flex-1 snap-start flex-col items-start" aria-current={active ? "step" : undefined}>
            <div className="flex w-full items-center">
              <span
                className={cx(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-[12px] font-bold transition-colors duration-300",
                  done && !skipped && "border-ink bg-ink text-card",
                  skipped && "border-line-strong bg-paper-2 text-stone",
                  active && "border-ink text-ink",
                  !done && !active && "border-line bg-card text-stone",
                )}
                style={active ? { background: a.hex, transitionDelay: `${i * 60}ms` } : { transitionDelay: `${i * 60}ms` }}
                aria-hidden
              >
                {skipped ? <Minus size={14} weight="bold" /> : done ? <Check size={14} weight="bold" /> : i + 1}
              </span>
              {!last && <span className={cx("h-[3px] flex-1 rounded-pill transition-colors duration-500", done ? "bg-ink" : "bg-paper-3")} style={{ transitionDelay: `${i * 60}ms` }} aria-hidden />}
            </div>
            <div className={cx("mt-2 pe-3 text-[12.5px] leading-tight", active ? "font-bold text-ink" : done ? "font-semibold text-ink" : "text-stone")}>
              {label}
              {optional && <span className="block text-[11px] font-normal text-stone">{skipped ? "skipped" : "optional"}</span>}
              {active && <span className="sr-only"> (current)</span>}
              {done && <span className="sr-only"> (done)</span>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
