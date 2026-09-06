"use client";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { PageHeader } from "@/components/shell/portal-shell";
import { useAppState, useHydrated } from "@/lib/store/hooks";
import type { Market, Platform, Verification } from "@/lib/store/types";
import { useLang } from "@/lib/i18n/provider";
import { EmptyState } from "@/components/ui/primitives";
import { Stagger, StaggerItem } from "@/components/motion";
import { PageSkeleton } from "@/components/admin/section";
import { Pills } from "@/components/admin/pills";
import { CreatorRow } from "@/components/admin/creator-row";
import { RoleLine } from "@/components/admin/role-gate";
import { matchFor, PLATFORM_LABELS, PLATFORMS } from "@/components/admin/helpers";

const VERIFICATIONS: { value: Verification; label: string }[] = [
  { value: "verified", label: "Verified" },
  { value: "pending", label: "Pending" },
  { value: "unverified", label: "Unverified" },
];

export default function CreatorsPage() {
  return (
    <Suspense fallback={<PageSkeleton rows={2} />}>
      <CreatorsInner />
    </Suspense>
  );
}

function CreatorsInner() {
  const s = useAppState();
  const hydrated = useHydrated();
  const { t } = useLang();
  const search = useSearchParams();
  const initialVerification = search.get("verification") as Verification | null;

  const [q, setQ] = useState("");
  const [market, setMarket] = useState<Market | "">("");
  const [niche, setNiche] = useState("");
  const [verification, setVerification] = useState<Verification | "">(initialVerification && ["verified", "pending", "unverified"].includes(initialVerification) ? initialVerification : "");
  const [platform, setPlatform] = useState<Platform | "">("");
  const [campaignId, setCampaignId] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const campaign = s.campaigns.find((c) => c.id === campaignId);
  const openCampaigns = s.campaigns.filter((c) => c.stage !== "completed");
  const niches = useMemo(() => Array.from(new Set(s.creators.flatMap((c) => c.niches))).sort(), [s.creators]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = s.creators
      .filter((c) => !market || c.market === market)
      .filter((c) => !niche || c.niches.includes(niche))
      .filter((c) => !verification || c.verification === verification)
      .filter((c) => !platform || c.platforms.some((p) => p.platform === platform))
      .filter((c) => !needle || [c.name, c.handle, c.city, ...c.niches].some((x) => x.toLowerCase().includes(needle)))
      .map((c) => ({ c, match: campaign ? matchFor(s, c, campaign) : undefined }));
    return campaign ? list.sort((a, b) => (b.match ?? 0) - (a.match ?? 0)) : list.sort((a, b) => a.c.name.localeCompare(b.c.name));
  }, [s, q, market, niche, verification, platform, campaign]);

  if (!hydrated) return <PageSkeleton rows={2} />;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t.admin.creators} lede={`${s.creators.length} creators across the UAE and KSA. Open a row for the full profile, shortlist with the star, invite from inside.`}>
        <RoleLine caps={["creator.invite", "creator.verify"]} className="mt-3" />
      </PageHeader>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="relative block flex-1 sm:max-w-[420px]">
            <span className="sr-only">{t.common.search}</span>
            <MagnifyingGlass size={18} weight="bold" className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-stone" aria-hidden />
            <input className="field ps-11" placeholder="Name, handle, city or niche" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <label className="block sm:w-[300px]">
            <span className="label">Sort by match for</span>
            <select className="field" value={campaignId} onChange={(e) => setCampaignId(e.target.value)}>
              <option value="">No campaign, sort by name</option>
              {openCampaigns.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </label>
        </div>
        <Pills label="Market" allLabel={t.common.all} value={market} onChange={setMarket} options={[{ value: "UAE", label: "UAE", count: s.creators.filter((c) => c.market === "UAE").length }, { value: "KSA", label: "KSA", count: s.creators.filter((c) => c.market === "KSA").length }]} />
        <Pills label="Niche" allLabel={t.common.all} value={niche} onChange={setNiche} options={niches.map((n) => ({ value: n, label: n }))} />
        <Pills label="Verification" allLabel={t.common.all} value={verification} onChange={setVerification} options={VERIFICATIONS.map((v) => ({ ...v, count: s.creators.filter((c) => c.verification === v.value).length }))} />
        <Pills label="Platform" allLabel={t.common.all} value={platform} onChange={setPlatform} options={PLATFORMS.map((p) => ({ value: p, label: PLATFORM_LABELS[p] }))} />
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No creator matches" body="Loosen a filter. The Squad is small on purpose in this demo." />
      ) : (
        <Stagger className="flex flex-col gap-2" amount={0.05}>
          {rows.map(({ c, match }) => (
            <StaggerItem key={c.id}>
              <CreatorRow s={s} c={c} open={open === c.id} onToggle={() => setOpen(open === c.id ? null : c.id)} campaign={campaign} match={match} campaignOptions={openCampaigns} />
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}
