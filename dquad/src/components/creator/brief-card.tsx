"use client";
import { CheckCircle, Prohibit, Target, FileVideo, Sparkle } from "@phosphor-icons/react";
import { ACCENT } from "@/components/ui/accent";
import type { Accent, Campaign } from "@/lib/store/types";
import { CRITERIA } from "@/lib/store/scoring";

/** The brief: objective, must haves, things to avoid, tone, deliverable, criteria with weights. */
export function BriefCard({ campaign, accent = "grass" }: { campaign: Campaign; accent?: Accent }) {
  const a = ACCENT[accent];
  const criteria = campaign.criteria.length ? campaign.criteria : CRITERIA;
  return (
    <section className="card p-5 sm:p-6" aria-labelledby="brief-title">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-ink" style={{ background: a.hex }} aria-hidden>
          <Target size={22} weight="fill" className="text-ink" />
        </span>
        <div>
          <h2 id="brief-title" className="display-sm">The brief</h2>
          <p className="mt-1 text-[15px] leading-relaxed text-ink">{campaign.objective}</p>
          <p className="mt-1 text-[12.5px] text-stone">Written by {campaign.ownerName}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="rounded-input border border-line bg-paper-2/60 p-4">
          <div className="mb-2 flex items-center gap-1.5 text-[13px] font-bold">
            <CheckCircle size={16} weight="fill" /> Must be in
          </div>
          <ul className="flex flex-col gap-1.5 text-[14px]">
            {campaign.mustHave.map((m) => (
              <li key={m} className="flex items-start gap-2">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-ink" aria-hidden /> {m}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-input border border-line bg-paper-2/60 p-4">
          <div className="mb-2 flex items-center gap-1.5 text-[13px] font-bold">
            <Prohibit size={16} weight="bold" /> Please avoid
          </div>
          <ul className="flex flex-col gap-1.5 text-[14px]">
            {campaign.avoid.map((m) => (
              <li key={m} className="flex items-start gap-2">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-stone" aria-hidden /> {m}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="flex items-start gap-2.5">
          <Sparkle size={18} weight="fill" className="mt-0.5 shrink-0 text-ink" />
          <div>
            <dt className="text-[12.5px] font-semibold text-stone">Tone</dt>
            <dd className="text-[14.5px] text-ink">{campaign.tone}</dd>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <FileVideo size={18} weight="fill" className="mt-0.5 shrink-0 text-ink" />
          <div>
            <dt className="text-[12.5px] font-semibold text-stone">Deliverable</dt>
            <dd className="text-[14.5px] text-ink">{campaign.deliverable}</dd>
          </div>
        </div>
      </dl>

      <div className="mt-6">
        <div className="text-[13px] font-bold">How your cut gets read</div>
        <p className="mb-3 mt-0.5 text-[12.5px] text-stone">Five criteria, weighted. The simulated analysis and the reviewer both use them. There is no minimum score.</p>
        <ul className="flex flex-col gap-2.5">
          {criteria.map((c) => (
            <li key={c.id} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-0.5">
              <div className="text-[14px] font-semibold">{c.label}</div>
              <div className="text-[12.5px] font-semibold tabular text-stone">{c.weight}%</div>
              <div className="col-span-2 flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-pill bg-paper-3" aria-hidden>
                  <div className="h-full rounded-pill" style={{ width: `${c.weight * 2.5}%`, background: a.hex }} />
                </div>
              </div>
              <div className="col-span-2 text-[12.5px] text-stone">{c.guidance}</div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
