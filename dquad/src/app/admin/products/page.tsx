"use client";
import { useState } from "react";
import { ArrowSquareOut, CheckCircle, Hourglass, Warning } from "@phosphor-icons/react";
import { PageHeader } from "@/components/shell/portal-shell";
import { useAppState, useHydrated } from "@/lib/store/hooks";
import { toggleKsa } from "@/lib/store/actions";
import type { Brand } from "@/lib/store/types";
import { useLang } from "@/lib/i18n/provider";
import { cx, fmtDateLong } from "@/lib/format";
import { ACCENT } from "@/components/ui/accent";
import { Notice, SimTag, Tag } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { Pack } from "@/components/art/pack";
import { Stagger, StaggerItem } from "@/components/motion";
import { PageSkeleton, KV } from "@/components/admin/section";
import { ExpandRow } from "@/components/admin/expand-row";
import { RoleLine, RoleNotice, useActor } from "@/components/admin/role-gate";
import { packLabel } from "@/components/admin/helpers";

const SYNC: Record<Brand["syncStatus"], { label: string; Icon: typeof CheckCircle }> = {
  synced: { label: "Synced", Icon: CheckCircle },
  partial: { label: "Partial sync", Icon: Warning },
  pending: { label: "Sync pending", Icon: Hourglass },
};

export default function ProductsPage() {
  const s = useAppState();
  const hydrated = useHydrated();
  const { t, lang } = useLang();
  const { allowed } = useActor();
  const { toast } = useToast();
  const [open, setOpen] = useState<string | null>(null);
  const canEdit = allowed("products.edit");

  if (!hydrated) return <PageSkeleton rows={3} />;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Product library" lede={`${s.brands.length} brands, ${s.products.length} products. The official library every brief picks from.`}>
        <RoleLine caps={["products.edit"]} className="mt-3" />
      </PageHeader>

      <Notice kind="warning">
        <span className="font-semibold">Provisional catalogue.</span> The UAE site could not be fetched during the build, so counts and sync dates are placeholders until the next sync.
      </Notice>
      <RoleNotice cap="products.edit" />

      <Stagger className="flex flex-col gap-2" amount={0.05}>
        {s.brands.map((b) => {
          const products = s.products.filter((p) => p.brandId === b.id);
          const sync = SYNC[b.syncStatus];
          const ksaCount = products.filter((p) => p.ksaAvailable).length;
          return (
            <StaggerItem key={b.id}>
              <ExpandRow
                open={open === b.id}
                onToggle={() => setOpen(open === b.id ? null : b.id)}
                accentHex={ACCENT[b.accent].hex}
                summary={
                  <div className="flex items-center gap-3">
                    <div className="flex h-[60px] w-[44px] shrink-0 items-center justify-center rounded-input" style={{ background: ACCENT[b.accent].softHex }}>
                      <Pack shape={b.packShape} accent={b.accent} label={packLabel(b)} size={26} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="font-display text-[17px] font-bold leading-tight">{b.name}</span>
                        <Tag outline>{b.category}</Tag>
                      </div>
                      <div className="mt-0.5 text-[13px] text-stone">{b.tagline}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12.5px] text-stone">
                        <span className="inline-flex items-center gap-1 font-semibold text-ink"><sync.Icon size={14} weight="fill" aria-hidden />{sync.label}</span>
                        <span><span className="font-semibold text-ink tabular">{b.skuCount}</span> {b.skuCount === 1 ? "SKU" : "SKUs"} listed, <span className="font-semibold text-ink tabular">{products.length}</span> in library</span>
                        <span>Synced {fmtDateLong(b.syncedAt, lang)}</span>
                        <span><span className="font-semibold text-ink tabular">{ksaCount}</span>/{products.length} in KSA</span>
                      </div>
                    </div>
                  </div>
                }
                actions={
                  <a href={b.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-pill border border-line px-3 py-1.5 text-[12.5px] font-semibold hover:bg-paper-2" aria-label={`${b.name} source page, opens in a new tab`}>
                    Source <ArrowSquareOut size={13} weight="bold" aria-hidden />
                  </a>
                }
              >
                {products.length === 0 ? (
                  <p className="text-[13.5px] text-stone">No products synced yet.</p>
                ) : (
                  <ul className="flex flex-col divide-y divide-line">
                    {products.map((p) => (
                      <li key={p.id} className="grid gap-3 py-3 md:grid-cols-[1.4fr_1fr_auto] md:items-center">
                        <div>
                          <div className="font-semibold leading-tight">{p.name}</div>
                          <div className="text-[13px] text-stone">{p.type}. {p.description}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-1 md:gap-1">
                          <KV label="Hero ingredient"><span className="text-[13.5px]">{p.heroIngredient}</span></KV>
                          <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 self-end text-[12.5px] font-semibold underline underline-offset-4 hover:text-grass md:self-start">
                            Source page <ArrowSquareOut size={12} weight="bold" aria-hidden />
                          </a>
                        </div>
                        <div className="flex items-center gap-2 md:justify-end">
                          <span className="text-[12px] text-stone">KSA availability</span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={p.ksaAvailable}
                            aria-label={`${p.name} available in KSA`}
                            disabled={!canEdit}
                            onClick={() => {
                              toggleKsa(p.id);
                              toast(`${p.name}: ${p.ksaAvailable ? "hidden in KSA" : "available in KSA"}`, "Mock market flag over the UAE catalogue.", "info");
                            }}
                            className={cx("relative inline-flex h-7 w-12 shrink-0 items-center rounded-pill border-2 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50", p.ksaAvailable ? "border-ink bg-grass" : "border-line-strong bg-paper-3")}
                          >
                            <span className={cx("absolute top-0.5 h-5 w-5 rounded-full bg-card transition-[inset-inline-start] duration-200", p.ksaAvailable ? "start-[22px]" : "start-0.5")} aria-hidden />
                          </button>
                          <span className="text-[12.5px] font-semibold">{p.ksaAvailable ? "KSA" : "UAE only"}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-3 flex flex-wrap items-center gap-2 text-[12.5px] text-stone">
                  KSA toggle is a mock market flag over the UAE catalogue. <SimTag>{t.common.simulated}</SimTag>
                </p>
              </ExpandRow>
            </StaggerItem>
          );
        })}
      </Stagger>
    </div>
  );
}
