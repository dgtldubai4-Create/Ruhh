"use client";
import Link from "next/link";
import { CalendarBlank, Coins, UsersThree } from "@phosphor-icons/react";
import { STAGES } from "@/lib/store/actions";
import type { AppState, Campaign, CampaignStage } from "@/lib/store/types";
import { useLang } from "@/lib/i18n/provider";
import { cx, daysUntil, fmtDate, fmtPoints } from "@/lib/format";
import { ACCENT } from "@/components/ui/accent";
import { Tag } from "@/components/ui/primitives";
import { Pack } from "@/components/art/pack";
import { Stagger, StaggerItem } from "@/components/motion";
import { brandOf, effectiveDeadline, invitationSummary, packLabel, STAGE_ACCENT } from "./helpers";

/**
 * Six stage columns on wide screens, three on tablets, one grouped list on phones.
 * Same markup at every width; the grid decides the shape.
 */
export function StageBoard({ s, campaigns }: { s: AppState; campaigns: Campaign[] }) {
  const { t } = useLang();
  return (
    <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
      {STAGES.map((stage) => {
        const list = campaigns.filter((c) => c.stage === stage);
        return (
          <section key={stage} aria-labelledby={`stage-${stage}`} className="min-w-0">
            <div className="mb-2 flex items-center gap-2 px-1">
              <span className={cx("h-2.5 w-2.5 rounded-full", ACCENT[STAGE_ACCENT[stage]].bg)} aria-hidden />
              <h2 id={`stage-${stage}`} className="text-[13px] font-bold uppercase tracking-[0.12em] text-ink">{t.stages[stage]}</h2>
              <span className="ms-auto text-[12px] font-semibold tabular text-stone">{list.length}</span>
            </div>
            {list.length === 0 ? (
              <div className="rounded-card border border-dashed border-line px-4 py-5 text-center text-[13px] text-stone">{t.common.empty}</div>
            ) : (
              <Stagger className="flex flex-col gap-3" amount={0.05}>
                {list.map((c) => (
                  <StaggerItem key={c.id}>
                    <CampaignCard s={s} c={c} />
                  </StaggerItem>
                ))}
              </Stagger>
            )}
          </section>
        );
      })}
    </div>
  );
}

export function CampaignCard({ s, c, compact }: { s: AppState; c: Campaign; compact?: boolean }) {
  const { t, lang } = useLang();
  const brand = brandOf(s, c.brandId);
  const product = s.products.find((p) => p.id === c.productIds[0]);
  const a = ACCENT[brand?.accent ?? "grass"];
  const inv = invitationSummary(c);
  const deadline = effectiveDeadline(c);
  const days = daysUntil(deadline);
  return (
    <Link href={`/admin/campaigns/${c.id}`} className="card card-lift block overflow-hidden hover:border-ink">
      <div className="flex items-start gap-3 p-4">
        <span className="h-full w-1.5 shrink-0 self-stretch rounded-pill" style={{ background: a.hex }} aria-hidden />
        <div className="shrink-0">
          <Pack shape={brand?.packShape} accent={brand?.accent} label={brand ? packLabel(brand) : "Dabur"} sub={product?.type.toLowerCase()} size={compact ? 34 : 44} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11.5px] font-semibold text-stone">{brand?.name}</div>
          <div className="font-display text-[16px] font-bold leading-tight">{c.title}</div>
          <div className="mt-2 flex flex-wrap gap-1">
            {c.markets.map((m) => (
              <Tag key={m} outline>{m}</Tag>
            ))}
            {c.extendedDeadline && <Tag accent="sun">Extended</Tag>}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line px-4 py-2.5 text-[12.5px] text-stone">
        <span className="inline-flex items-center gap-1" title={t.common.deadline}>
          <CalendarBlank size={14} weight="bold" />
          {fmtDate(deadline, lang)}
          {c.stage !== "completed" && <span className={cx("tabular", days < 0 && "font-semibold text-ink")}>{days < 0 ? `(${Math.abs(days)}d over)` : `(${days}d)`}</span>}
        </span>
        <span className="inline-flex items-center gap-1" title="Invitations">
          <UsersThree size={14} weight="bold" />
          <span className="tabular">{inv.accepted}</span> in, <span className="tabular">{inv.pending}</span> waiting{inv.declined > 0 && <>, <span className="tabular">{inv.declined}</span> out</>}
        </span>
        <span className="ms-auto inline-flex items-center gap-1 font-semibold text-ink">
          <Coins size={14} weight="bold" />
          <span className="tabular">{fmtPoints(c.points)}</span> {t.common.pts}
        </span>
      </div>
    </Link>
  );
}

export function StageTag({ stage }: { stage: CampaignStage }) {
  const { t } = useLang();
  return <Tag accent={STAGE_ACCENT[stage]}>{t.stages[stage]}</Tag>;
}
