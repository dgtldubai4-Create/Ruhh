"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlass, Plus } from "@phosphor-icons/react";
import { PageHeader } from "@/components/shell/portal-shell";
import { useAppState, useHydrated } from "@/lib/store/hooks";
import { useLang } from "@/lib/i18n/provider";
import { EmptyState } from "@/components/ui/primitives";
import { PageSkeleton } from "@/components/admin/section";
import { Pills } from "@/components/admin/pills";
import { StageBoard } from "@/components/admin/stage-board";
import { CampaignForm } from "@/components/admin/campaign-form";
import { RoleNotice, useActor } from "@/components/admin/role-gate";
import type { Market } from "@/lib/store/types";

export default function CampaignsPage() {
  const s = useAppState();
  const hydrated = useHydrated();
  const router = useRouter();
  const { t } = useLang();
  const { allowed } = useActor();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState("");
  const [market, setMarket] = useState<Market | "">("");

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return s.campaigns.filter((c) => (!brand || c.brandId === brand) && (!market || c.markets.includes(market)) && (!needle || c.title.toLowerCase().includes(needle) || c.objective.toLowerCase().includes(needle)));
  }, [s.campaigns, q, brand, market]);

  if (!hydrated) return <PageSkeleton rows={6} />;

  const brandsInUse = s.brands.filter((b) => s.campaigns.some((c) => c.brandId === b.id));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t.admin.campaigns}
        lede="Every brief in one place, from first draft to released points. Open a card to run it."
        aside={
          allowed("campaign.edit") && (
            <button type="button" className="btn-grass" onClick={() => setOpen(true)}>
              <Plus size={18} weight="bold" /> New campaign
            </button>
          )
        }
      />
      <RoleNotice cap="campaign.edit" />

      <div className="flex flex-col gap-3">
        <label className="relative block max-w-[420px]">
          <span className="sr-only">{t.common.search}</span>
          <MagnifyingGlass size={18} weight="bold" className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-stone" aria-hidden />
          <input className="field ps-11" placeholder="Search titles and objectives" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <div className="flex flex-col gap-2">
          <Pills label="Brand" allLabel={t.common.all} value={brand} onChange={setBrand} options={brandsInUse.map((b) => ({ value: b.id, label: b.name, count: s.campaigns.filter((c) => c.brandId === b.id).length }))} />
          <Pills label="Market" allLabel={t.common.all} value={market} onChange={setMarket} options={[{ value: "UAE", label: "UAE" }, { value: "KSA", label: "KSA" }]} />
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState title="No campaign matches" body="Clear a filter or start a new brief." action={allowed("campaign.edit") ? <button type="button" className="btn-paper btn-sm" onClick={() => setOpen(true)}>New campaign</button> : undefined} />
      ) : (
        <StageBoard s={s} campaigns={list} />
      )}

      <CampaignForm open={open} onClose={() => setOpen(false)} onSaved={(id) => router.push(`/admin/campaigns/${id}`)} />
    </div>
  );
}
