"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle, Coins, Gift, GraduationCap, HourglassMedium, MapPin, Package, ShoppingBag, TShirt, VideoCamera, Warning } from "@phosphor-icons/react";
import { PageHeader } from "@/components/shell/portal-shell";
import { Reveal, Stagger, StaggerItem, Tilt, PaperBurst } from "@/components/motion";
import { Art, PaperScene, PointsCoin, Sticker } from "@/components/art/scenes";
import { Pack } from "@/components/art/pack";
import { ACCENT } from "@/components/ui/accent";
import { EmptyState, Notice, SimTag, Tag } from "@/components/ui/primitives";
import { Sheet, useToast } from "@/components/ui/overlays";
import { balances, redeemReward } from "@/lib/store/actions";
import { useLang } from "@/lib/i18n/provider";
import { cx, fmtPoints } from "@/lib/format";
import type { Reward } from "@/lib/store/types";
import { useCreator, brandOf, validateAddress } from "@/components/creator/helpers";
import { LedgerList } from "@/components/creator/ledger-list";
import { ShipmentTracker } from "@/components/creator/shipment-tracker";
import { SectionTitle } from "@/components/creator/section";

const CATEGORY: Record<Reward["category"], { label: string; icon: typeof Gift }> = {
  product: { label: "Product bundle", icon: Package },
  gear: { label: "Gear", icon: VideoCamera },
  learning: { label: "Learning", icon: GraduationCap },
  merch: { label: "Merch", icon: TShirt },
};

export default function CreatorRewards() {
  const { s, creator, creatorId } = useCreator();
  const { t } = useLang();
  const { toast } = useToast();
  const bal = balances(s, creatorId);
  const [picked, setPicked] = useState<Reward | null>(null);
  const [address, setAddress] = useState(creator.address);
  const [addrError, setAddrError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [burst, setBurst] = useState(0);

  const entries = useMemo(() => s.ledger.filter((l) => l.creatorId === creatorId), [s.ledger, creatorId]);
  const shipments = useMemo(() => s.shipments.filter((sh) => sh.creatorId === creatorId).sort((a, b) => (a.status === "delivered" ? 1 : 0) - (b.status === "delivered" ? 1 : 0)), [s.shipments, creatorId]);
  const [showAll, setShowAll] = useState(false);

  const openRedeem = (r: Reward) => {
    setPicked(r);
    setAddress(creator.address);
    setAddrError(null);
    setFailure(null);
  };
  const confirm = () => {
    if (!picked) return;
    const err = validateAddress(address);
    if (err) {
      setAddrError(err);
      return;
    }
    setBusy(true);
    window.setTimeout(() => {
      const res = redeemReward(picked.id, creatorId, address.trim());
      setBusy(false);
      if (res.ok) {
        setBurst((b) => b + 1);
        toast(`${picked.name} is yours`, `${fmtPoints(picked.points)} points spent. Track the parcel under Deliveries.`);
        setPicked(null);
      } else {
        setFailure(res.reason === "out_of_stock" ? "Someone got the last one a moment ago. Nothing was charged." : res.reason === "insufficient" ? "Your available balance is short for this reward. Nothing was charged." : "Something went sideways. Nothing was charged.");
      }
    }, 480);
  };

  return (
    <div className="relative">
      <PaperBurst trigger={burst} />
      <PageHeader title={t.creator.rewards} lede="Points are the Squad's way of keeping score. Spend them on things you actually want, and track every parcel to your door." />

      {/* Balance */}
      <Reveal y={12} amount={0.05}>
        <div className="grid gap-5 lg:grid-cols-12">
          <div className="relative flex flex-col gap-5 rounded-card border border-line-strong bg-card p-5 sm:flex-row sm:items-center sm:gap-8 sm:p-6 lg:col-span-8">
            <PointsCoin size={84} className="shrink-0" />
            <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <div className="text-[12.5px] font-semibold text-stone">{t.creator.availablePts}</div>
                <div className="font-display text-[34px] font-bold leading-none tabular text-grass">{fmtPoints(bal.available)}</div>
              </div>
              <div>
                <div className="text-[12.5px] font-semibold text-stone">{t.creator.pendingPts}</div>
                <div className="font-display text-[34px] font-bold leading-none tabular">{fmtPoints(bal.pending)}</div>
              </div>
              <div>
                <div className="text-[12.5px] font-semibold text-stone">Earned all time</div>
                <div className="font-display text-[24px] font-bold leading-none tabular">{fmtPoints(bal.earned)}</div>
              </div>
              <div>
                <div className="text-[12.5px] font-semibold text-stone">Spent</div>
                <div className="font-display text-[24px] font-bold leading-none tabular">{fmtPoints(bal.spent)}</div>
              </div>
            </div>
          </div>
          <div className="relative hidden lg:col-span-4 lg:block">
            <div className="card-paper h-full overflow-hidden rotate-1">
              <Art id="rewardsFlatlay" alt="Paper-cut flat lay of reward bundles" className="h-full min-h-[150px] w-full" fallback={<PaperScene accent="coral" />} />
            </div>
            <Sticker accent="sun" rotate={-5} className="absolute -start-3 top-4">
              <Coins size={14} weight="fill" /> Pending releases after verification
            </Sticker>
          </div>
        </div>
        {bal.pending > 0 && (
          <p className="mt-3 flex items-center gap-1.5 text-[13px] text-stone">
            <HourglassMedium size={15} weight="fill" className="text-ink" /> {fmtPoints(bal.pending)} points are pending: they release once a live post or quest is verified. Only the available balance can be spent.
          </p>
        )}
      </Reveal>

      {/* Catalogue */}
      <section className="mt-12" aria-labelledby="cat-title">
        <SectionTitle title={<span id="cat-title">The catalogue</span>} aside={<SimTag>Simulated stock</SimTag>} />
        <Stagger className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {s.rewards.map((r) => {
            const brand = r.brandId ? brandOf(s, r.brandId) : undefined;
            const a = ACCENT[r.accent];
            const out = r.stock <= 0;
            const short = Math.max(0, r.points - bal.available);
            const Cat = CATEGORY[r.category].icon;
            return (
              <StaggerItem key={r.id}>
                <Tilt max={6} scale={1.01} className="h-full">
                  <article className={cx("flex h-full flex-col overflow-hidden rounded-card border border-line-strong bg-card", out && "opacity-80")}>
                    <div className="relative flex h-[160px] items-end justify-center" style={{ background: a.softHex }}>
                      <span className="absolute -end-10 -top-10 h-40 w-40 rounded-full" style={{ background: a.hex, opacity: 0.5 }} aria-hidden />
                      {r.shape ? (
                        <div className="relative flex items-end gap-2 pb-2" aria-hidden>
                          <Pack shape={r.shape} accent={r.accent} label={brand ? brand.name.replace(/^Dabur\s+/i, "").split(" ")[0] : r.name.split(" ")[0]} size={64} tilt={-8} />
                          <Pack shape={r.shape === "bottle" ? "tube" : "box"} accent={r.accent} label={brand ? brand.name.replace(/^Dabur\s+/i, "").split(" ")[0] : r.name.split(" ")[0]} size={48} tilt={8} className="-ms-3" />
                        </div>
                      ) : (
                        <div className="relative flex h-full w-full items-center justify-center" aria-hidden>
                          <span className="flex h-20 w-20 items-center justify-center rounded-full border border-line-strong bg-card">
                            <Cat size={38} weight="fill" className="text-ink" />
                          </span>
                          <Sticker accent={r.accent} rotate={-8} className="absolute bottom-4 end-4">
                            {CATEGORY[r.category].label}
                          </Sticker>
                        </div>
                      )}
                      <div className="absolute start-4 top-4">
                        <Tag accent={r.accent}>
                          <Cat size={13} weight="fill" /> {CATEGORY[r.category].label}
                        </Tag>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-5">
                      <h3 className="display-sm">{r.name}</h3>
                      <p className="text-[13.5px] text-stone">{r.description}</p>
                      <div className="mt-1 flex items-center justify-between text-[13px]">
                        <span className="inline-flex items-center gap-1.5 font-display text-[20px] font-bold tabular">
                          <Coins size={18} weight="fill" /> {fmtPoints(r.points)}
                        </span>
                        <span className={cx("inline-flex items-center gap-1", out ? "font-semibold text-ink" : "text-stone")}>
                          {out ? <Warning size={14} weight="fill" /> : null}
                          {out ? "Out of stock" : r.stock <= 3 ? `Only ${r.stock} left` : `${r.stock} in stock`}
                        </span>
                      </div>
                      <div className="mt-auto pt-2">
                        {out ? (
                          <>
                            <button className="btn-paper btn-sm w-full" disabled>
                              Out of stock
                            </button>
                            <p className="help text-center">The team has been told. Check back after a restock.</p>
                          </>
                        ) : short > 0 ? (
                          <>
                            <button className="btn-paper btn-sm w-full" disabled aria-describedby={`short-${r.id}`}>
                              Redeem
                            </button>
                            <p id={`short-${r.id}`} className="help text-center">
                              Short by {fmtPoints(short)} points. {bal.pending >= short ? "Your pending points would cover it once verified." : "A campaign or two gets you there."}
                            </p>
                          </>
                        ) : (
                          <button className="btn-grass btn-sm w-full" onClick={() => openRedeem(r)}>
                            <ShoppingBag size={16} weight="fill" /> Redeem for {fmtPoints(r.points)}
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                </Tilt>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>

      <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-6">
        {/* History */}
        <section className="lg:col-span-6" aria-labelledby="hist-title">
          <SectionTitle title={<span id="hist-title">History</span>} />
          <LedgerList entries={entries} limit={showAll ? undefined : 6} />
          {entries.length > 6 && (
            <button className="btn-ghost btn-sm mt-3" onClick={() => setShowAll((v) => !v)}>
              {showAll ? "Show fewer" : `Show all ${entries.length} entries`}
            </button>
          )}
        </section>

        {/* Deliveries */}
        <section id="deliveries" className="scroll-mt-28 lg:col-span-6" aria-labelledby="del-title">
          <SectionTitle title={<span id="del-title">{t.creator.deliveries}</span>} />
          <div className="card-paper mb-4 overflow-hidden">
            <Art id="delivery" alt="Paper-cut courier van on a sunny street" className="aspect-[16/7] w-full" fallback={<PaperScene accent="sky" />} />
          </div>
          {shipments.length === 0 ? (
            <EmptyState title="No parcels yet" body="Redeem a reward or accept a campaign and the tracking shows up here." />
          ) : (
            <div className="flex flex-col gap-3">
              {shipments.map((sh) => (
                <ShipmentTracker key={sh.id} shipment={sh} />
              ))}
            </div>
          )}
          <p className="mt-3 text-[12px] text-stone">
            Delivery address on file: {creator.address}. <Link href="/creator/profile" className="font-semibold underline underline-offset-4">Change it</Link>
          </p>
        </section>
      </div>

      {/* Redeem sheet */}
      <Sheet
        open={Boolean(picked)}
        onClose={() => !busy && setPicked(null)}
        title={picked ? `Redeem ${picked.name}?` : ""}
        footer={
          <>
            <button className="btn-ghost" onClick={() => setPicked(null)} disabled={busy}>
              {t.common.cancel}
            </button>
            <button className="btn-grass" onClick={confirm} disabled={busy} aria-busy={busy}>
              <CheckCircle size={18} weight="fill" /> {busy ? "Confirming" : `Confirm, spend ${picked ? fmtPoints(picked.points) : ""}`}
            </button>
          </>
        }
      >
        {picked && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3 rounded-card border border-line bg-paper-2/60 px-4 py-3 text-[14px]">
              <span>
                <span className="font-semibold">{picked.name}</span>
                <span className="block text-[12.5px] text-stone">{picked.description}</span>
              </span>
              <span className="shrink-0 text-end">
                <span className="block font-display text-[20px] font-bold tabular">{fmtPoints(picked.points)}</span>
                <span className="block text-[12px] text-stone">leaves {fmtPoints(bal.available - picked.points)}</span>
              </span>
            </div>
            <div>
              <label htmlFor="redeem-address" className="label">
                Deliver to
              </label>
              <textarea
                id="redeem-address"
                className={cx("field min-h-[80px] resize-y", addrError && "field-error")}
                rows={3}
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  if (addrError) setAddrError(null);
                }}
                aria-invalid={Boolean(addrError)}
              />
              {addrError ? (
                <p className="error-text" role="alert">{addrError}</p>
              ) : (
                <p className="help inline-flex items-center gap-1">
                  <MapPin size={13} weight="fill" /> Prefilled from your profile. Edits here update it too.
                </p>
              )}
            </div>
            {failure && <Notice kind="error">{failure}</Notice>}
            <p className="text-[12.5px] text-stone">
              <SimTag>Simulated courier</SimTag> A parcel appears under Deliveries and logistics moves it along in the brand-team view.
            </p>
          </div>
        )}
      </Sheet>
    </div>
  );
}
