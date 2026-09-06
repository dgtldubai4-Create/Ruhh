"use client";
import { motion, useReducedMotion } from "motion/react";
import { ScoreRing, SimTag } from "@/components/ui/primitives";
import { ACCENT } from "@/components/ui/accent";
import { cx } from "@/lib/format";
import type { Accent, Criterion, Submission } from "@/lib/store/types";

/** ScoreRing plus a per-criterion read. Guidance only, there is no minimum score. */
export function ScoreBreakdown({ submission, criteria, accent = "grass", title }: { submission: Submission; criteria: Criterion[]; accent?: Accent; title?: string }) {
  const reduce = useReducedMotion();
  const a = ACCENT[accent];
  return (
    <div>
      <div className="flex flex-wrap items-center gap-4">
        <ScoreRing score={submission.score} accent={accent} size={96} label={`v${submission.version} score`} />
        <div className="min-w-0 flex-1">
          <div className="display-sm">{title ?? `Your read on v${submission.version}`}</div>
          <p className="mt-1 text-[13.5px] text-stone">
            Five things a viewer notices, each with a note. Use it as a second pair of eyes, not a verdict.
          </p>
          <div className="mt-2">
            <SimTag>Simulated analysis, guidance only, no minimum score</SimTag>
          </div>
        </div>
      </div>
      <ul className="mt-5 flex flex-col gap-3">
        {submission.breakdown.map((b, i) => {
          const c = criteria.find((x) => x.id === b.criterionId);
          return (
            <li key={b.criterionId} className="rounded-input border border-line bg-paper-2/60 px-4 py-3">
              <div className="flex items-baseline justify-between gap-3">
                <div className="text-[14px] font-semibold text-ink">
                  {c?.label ?? b.criterionId}
                  {c && <span className="ms-2 text-[12px] font-normal text-stone">weight {c.weight}%</span>}
                </div>
                <div className="font-display text-[18px] font-bold tabular">{b.score}</div>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-pill bg-paper-3" aria-hidden>
                <motion.div
                  className={cx("h-full rounded-pill")}
                  style={{ background: a.hex }}
                  initial={reduce ? { width: `${b.score}%` } : { width: 0 }}
                  animate={{ width: `${b.score}%` }}
                  transition={{ duration: 0.7, delay: reduce ? 0 : 0.1 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <p className="mt-2 text-[13px] text-stone">{b.note}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
