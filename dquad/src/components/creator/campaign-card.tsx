"use client";
import Link from "next/link";
import { ArrowRight, CalendarBlank, CheckCircle, Coins, XCircle } from "@phosphor-icons/react";
import { Pack } from "@/components/art/pack";
import { Steps, Tag } from "@/components/ui/primitives";
import { ACCENT } from "@/components/ui/accent";
import { useLang } from "@/lib/i18n/provider";
import { cx, fmtDate, fmtPoints } from "@/lib/format";
import type { AppState, Campaign } from "@/lib/store/types";
import { JOURNEY_STEPS, SUBMISSION_LABEL, brandOf, campaignJourney, deadlineLabel, effectiveDeadline, firstProductOf, packLabel, type Journey } from "./helpers";

/** Plain-language line about where the creator is in this campaign. */
export function journeyLine(j: Journey): string {
  if (j.declined) return "You passed on this one.";
  if (j.pending) return "Invitation waiting for your answer.";
  if (j.complete) return "Verified and paid out. Nice work.";
  if (j.publication?.verification === "verified") return "Post verified, points on their way.";
  if (j.publication) return "Live link received, waiting for verification.";
  if (j.latest?.status === "approved") return "Approved. Publish it and paste the link.";
  if (j.latest?.status === "changes_requested") return `One more pass on v${j.latest.version}, the reviewer left notes.`;
  if (j.latest) return `v${j.latest.version} is with the reviewer.`;
  if (j.current === 3) return "Script saved. Film it and upload when ready.";
  return "Brief unlocked. Read it, then film.";
}

export function CampaignCard({ s, campaign, creatorId, onAccept, onDecline, className }: { s: AppState; campaign: Campaign; creatorId: string; onAccept?: (c: Campaign) => void; onDecline?: (c: Campaign) => void; className?: string }) {
  const { t, lang, dir } = useLang();
  const brand = brandOf(s, campaign.brandId);
  const product = firstProductOf(s, campaign);
  const accent = brand?.accent ?? "grass";
  const a = ACCENT[accent];
  const j = campaignJourney(s, campaign, creatorId);
  const deadline = effectiveDeadline(campaign);
  const href = `/creator/campaigns/${campaign.id}`;

  return (
    <article className={cx("card-lift flex h-full flex-col overflow-hidden rounded-card border border-line-strong bg-card", className)}>
      <Link href={href} className="relative block h-[150px] overflow-hidden" style={{ background: a.softHex }} aria-label={`${campaign.title}, open`}>
        <span className="absolute -end-8 -top-10 h-36 w-36 rounded-full" style={{ background: a.hex, opacity: 0.55 }} aria-hidden />
        <div className="absolute start-6 top-4">
          <Pack shape={brand?.packShape} accent={accent} label={packLabel(brand)} sub={product?.type.toLowerCase()} size={78} tilt={-6} />
        </div>
        <div className="absolute end-4 top-4 flex flex-col items-end gap-1.5">
          <Tag accent={accent}>{t.stages[campaign.stage]}</Tag>
          {j.pending && <Tag outline>{t.common.pending}</Tag>}
          {j.declined && <Tag outline>{t.common.declined}</Tag>}
          {j.latest && !j.publication && <Tag outline>{SUBMISSION_LABEL[j.latest.status]}</Tag>}
        </div>
        <div className="absolute bottom-4 end-4 text-end text-[12px] font-semibold text-ink/80">{brand?.name}</div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="display-sm text-balance">
            <Link href={href} className="hover:underline">
              {campaign.title}
            </Link>
          </h3>
          <p className="mt-1 text-[13.5px] text-stone">{journeyLine(j)}</p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-ink">
          <span className="inline-flex items-center gap-1.5">
            <Coins size={16} weight="fill" /> {fmtPoints(campaign.points)} {t.common.pts}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarBlank size={16} weight="fill" /> {fmtDate(deadline, lang)}
            {!j.complete && !j.declined && <span className="text-stone">({deadlineLabel(deadline)})</span>}
          </span>
        </div>

        {j.accepted && (
          <div>
            <Steps steps={[...JOURNEY_STEPS]} current={j.current} accent={accent} compact />
            <div className="mt-1.5 text-[11.5px] text-stone">
              {j.complete ? "Every step done" : `${JOURNEY_STEPS[Math.min(j.current, JOURNEY_STEPS.length - 1)]}, step ${Math.min(j.current + 1, JOURNEY_STEPS.length)} of ${JOURNEY_STEPS.length}`}
            </div>
          </div>
        )}

        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          {j.pending ? (
            <>
              <button className="btn-grass btn-sm" onClick={() => onAccept?.(campaign)}>
                <CheckCircle size={16} weight="fill" /> {t.common.accept}
              </button>
              <button className="btn-paper btn-sm" onClick={() => onDecline?.(campaign)}>
                <XCircle size={16} weight="fill" /> {t.common.decline}
              </button>
              <Link href={href} className="btn-ghost btn-sm ms-auto">
                Read brief <ArrowRight size={14} weight="bold" className={dir === "rtl" ? "rotate-180" : ""} />
              </Link>
            </>
          ) : (
            <Link href={href} className={cx("btn-sm", j.declined ? "btn-ghost" : "btn-ink")}>
              {j.declined ? "View" : j.complete ? "See the result" : "Open campaign"} <ArrowRight size={14} weight="bold" className={dir === "rtl" ? "rotate-180" : ""} />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
