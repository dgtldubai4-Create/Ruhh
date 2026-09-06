"use client";
import { useMemo } from "react";
import { AnimatePresence, LayoutGroup } from "motion/react";
import { PageHeader } from "@/components/shell/portal-shell";
import { useAppState, useHydrated } from "@/lib/store/hooks";
import { useLang } from "@/lib/i18n/provider";
import { cx } from "@/lib/format";
import { Notice } from "@/components/ui/primitives";
import { Art, PaperScene } from "@/components/art/scenes";
import { Reveal } from "@/components/motion";
import { PageSkeleton, SectionTitle } from "@/components/admin/section";
import { ParcelCard } from "@/components/admin/parcel-card";
import { RoleLine, RoleNotice } from "@/components/admin/role-gate";
import { LOGISTICS_ORDER } from "@/components/admin/helpers";

export default function LogisticsPage() {
  const s = useAppState();
  const hydrated = useHydrated();
  const { t } = useLang();

  const groups = useMemo(() => LOGISTICS_ORDER.map((st) => ({ status: st, items: s.shipments.filter((x) => x.status === st) })), [s.shipments]);

  if (!hydrated) return <PageSkeleton rows={3} />;

  const moving = s.shipments.filter((x) => x.status !== "delivered").length;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid items-center gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <PageHeader title={t.admin.logistics} lede={`${moving} ${moving === 1 ? "parcel is" : "parcels are"} on the move. Product kits go out when a creator accepts, rewards when points are spent. Advance each one as the courier confirms.`}>
            <RoleLine caps={["logistics.advance"]} className="mt-3" />
          </PageHeader>
        </div>
        <Reveal className="lg:col-span-5" delay={0.1}>
          <div className="card-paper overflow-hidden rotate-[1deg]">
            <Art id="delivery" alt="Paper-cut delivery van with parcels" className="aspect-[16/9] w-full" fallback={<PaperScene accent="sky" />} />
          </div>
        </Reveal>
      </div>

      <RoleNotice cap="logistics.advance" />
      <Notice>Couriers and tracking numbers are simulated. Advancing a parcel sends the creator a simulated in-app note, or an email on dispatch and delivery.</Notice>

      <div className="flex flex-wrap gap-2">
        {groups.map((g, i) => (
          <a key={g.status} href={`#parcels-${g.status}`} className={cx("inline-flex items-center gap-1.5 rounded-pill border border-line bg-card px-3 py-1.5 text-[13px] hover:bg-paper-2", g.items.length === 0 && "text-stone")}>
            <span className="tabular text-[11px] text-stone">{i + 1}</span> {t.logistics[g.status]} <span className="font-semibold tabular">{g.items.length}</span>
          </a>
        ))}
      </div>

      <LayoutGroup>
        {groups.map((g, i) => (
          <section key={g.status} id={`parcels-${g.status}`} aria-labelledby={`parcels-${g.status}-title`} className="scroll-mt-24">
            <SectionTitle id={`parcels-${g.status}-title`} title={<span><span className="me-2 text-stone tabular">{i + 1}.</span>{t.logistics[g.status]}</span>} count={g.items.length} />
            {g.items.length === 0 ? (
              <div className="rounded-card border border-dashed border-line px-4 py-5 text-center text-[13.5px] text-stone">{t.common.empty}</div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <AnimatePresence initial={false}>
                  {g.items.map((sh) => (
                    // A lone parcel stretches across the row so a group never sits mostly empty.
                    <ParcelCard key={sh.id} s={s} sh={sh} className={g.items.length === 1 ? "md:col-span-2 xl:col-span-3" : undefined} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </section>
        ))}
      </LayoutGroup>
    </div>
  );
}
