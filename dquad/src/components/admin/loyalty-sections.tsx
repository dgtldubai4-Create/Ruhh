"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowSquareOut, CheckCircle, Coins, Gift, Hourglass, Minus, Plus, SealCheck, XCircle } from "@phosphor-icons/react";
import type { AppState, Reward } from "@/lib/store/types";
import { adjustPoints, balances, completeQuest, releasePoints, simulate, updateRewardStock, verifyPublication } from "@/lib/store/actions";
import { useLang } from "@/lib/i18n/provider";
import { cx, fmtDate, fmtDateTime, fmtFollowers, fmtPoints } from "@/lib/format";
import { ACCENT } from "@/components/ui/accent";
import { EmptyState, Notice, SimTag, Stat, Tag } from "@/components/ui/primitives";
import { Sheet, useToast } from "@/components/ui/overlays";
import { Pack } from "@/components/art/pack";
import { Art, PaperScene } from "@/components/art/scenes";
import { Counter, PaperBurst, Reveal, Stagger, StaggerItem } from "@/components/motion";
import { ExpandRow } from "./expand-row";
import { SectionTitle, KV } from "./section";
import { RoleNotice, useActor } from "./role-gate";
import { Portrait } from "./creator-row";
import { brandOf, campaignOf, creatorOf, packLabel, PLATFORM_LABELS } from "./helpers";

/* ------------------------------------------------------------------ */
/* Verify posts                                                         */
/* ------------------------------------------------------------------ */
export function VerifyPosts({ s }: { s: AppState }) {
  const { t, lang } = useLang();
  const { actor, allowed } = useActor();
  const { toast } = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const [burst, setBurst] = useState<Record<string, number>>({});
  const openPubs = s.publications.filter((p) => !p.pointsReleased);
  const done = s.publications.filter((p) => p.pointsReleased);

  async function verify(id: string) {
    setBusy(id);
    await simulate(() => verifyPublication(id, actor));
    setBusy(null);
    toast("Post verified", "Release the points when you are ready.", "info");
  }
  async function release(id: string, points: number, name: string) {
    setBusy(id);
    await simulate(() => releasePoints(id, actor));
    setBusy(null);
    setBurst((b) => ({ ...b, [id]: (b[id] ?? 0) + 1 }));
    toast(`${fmtPoints(points)} points released`, `${name} gets a simulated email. Pending moved to available.`);
  }

  return (
    <div className="flex flex-col gap-6">
      <RoleNotice cap="loyalty.release" />
      <section aria-labelledby="verify-title">
        <SectionTitle id="verify-title" title="Waiting on you" count={openPubs.length} />
        {openPubs.length === 0 ? (
          <EmptyState title="No posts to verify" body="When an approved creator pastes a live link it shows up here." />
        ) : (
          <Stagger className="grid gap-3 md:grid-cols-2">
            {openPubs.map((p) => {
              const cr = creatorOf(s, p.creatorId);
              const c = campaignOf(s, p.campaignId);
              const verified = p.verification === "verified";
              return (
                <StaggerItem key={p.id}>
                  <article className="card relative flex h-full flex-col gap-3 p-4 sm:p-5">
                    <PaperBurst trigger={burst[p.id] ?? 0} />
                    <div className="flex items-center gap-3">
                      {cr && <Portrait c={cr} size={44} />}
                      <div className="min-w-0 flex-1">
                        <div className="font-display text-[16px] font-bold leading-tight">{cr?.name}</div>
                        <div className="text-[13px] text-stone">{c?.title}</div>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold">
                        {verified ? <CheckCircle size={16} weight="fill" aria-hidden /> : <Hourglass size={16} weight="fill" aria-hidden />}
                        {verified ? "Verified" : "Pending"}
                      </span>
                    </div>
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[13.5px] underline underline-offset-4 hover:text-grass">
                      {PLATFORM_LABELS[p.platform]}, posted {fmtDate(p.postedAt, lang)} <ArrowSquareOut size={13} weight="bold" aria-hidden />
                    </a>
                    <div className="flex flex-wrap gap-3 text-[12.5px] text-stone">
                      <span><span className="font-semibold text-ink tabular">{fmtFollowers(p.engagement.views)}</span> views</span>
                      <span><span className="font-semibold text-ink tabular">{fmtFollowers(p.engagement.likes)}</span> likes</span>
                      <span><span className="font-semibold text-ink tabular">{p.engagement.comments}</span> comments</span>
                      <SimTag>{t.common.simulated}</SimTag>
                    </div>
                    <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
                      <span className="inline-flex items-center gap-1 font-display text-[18px] font-bold tabular"><Coins size={18} weight="fill" aria-hidden />{fmtPoints(c?.points ?? 0)}</span>
                      <span className="text-[12.5px] text-stone">pending</span>
                      {allowed("loyalty.release") && (
                        <span className="ms-auto">
                          {verified ? (
                            <button type="button" className="btn-grass btn-sm" onClick={() => release(p.id, c?.points ?? 0, cr?.name.split(" ")[0] ?? "The creator")} disabled={busy === p.id} aria-busy={busy === p.id}>
                              <Coins size={16} weight="bold" /> {busy === p.id ? "Releasing" : "Release points"}
                            </button>
                          ) : (
                            <button type="button" className="btn-ink btn-sm" onClick={() => verify(p.id)} disabled={busy === p.id} aria-busy={busy === p.id}>
                              <SealCheck size={16} weight="bold" /> {busy === p.id ? "Checking" : "Verify post"}
                            </button>
                          )}
                        </span>
                      )}
                    </div>
                  </article>
                </StaggerItem>
              );
            })}
          </Stagger>
        )}
      </section>
      {done.length > 0 && (
        <section aria-labelledby="released-title">
          <SectionTitle id="released-title" title="Released" count={done.length} />
          <ul className="card divide-y divide-line">
            {done.map((p) => {
              const cr = creatorOf(s, p.creatorId);
              const c = campaignOf(s, p.campaignId);
              return (
                <li key={p.id} className="flex items-center gap-3 px-4 py-3">
                  {cr && <Portrait c={cr} size={32} />}
                  <span className="min-w-0 flex-1 text-[14px]"><span className="font-semibold">{cr?.name}</span>, {c?.title}</span>
                  <span className="inline-flex items-center gap-1 text-[13px] font-semibold"><CheckCircle size={16} weight="fill" aria-hidden />{fmtPoints(c?.points ?? 0)} {t.common.pts}</span>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Quest reviews                                                        */
/* ------------------------------------------------------------------ */
export function QuestReviews({ s }: { s: AppState }) {
  const { lang } = useLang();
  const { actor, allowed } = useActor();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const items = s.participations.filter((p) => p.status === "in_review" || p.status === "submitted");

  async function complete(questId: string, creatorId: string, points: number) {
    const key = `${questId}-${creatorId}`;
    const fb = (notes[key] ?? "").trim();
    if (fb.length < 6) {
      setErrors((e) => ({ ...e, [key]: "Leave the creator a line of feedback. It goes with the points." }));
      return;
    }
    setErrors((e) => ({ ...e, [key]: "" }));
    setBusy(key);
    await simulate(() => completeQuest(questId, creatorId, actor, fb));
    setBusy(null);
    toast(`${fmtPoints(points)} points released`, "The quest is complete and the creator has your note.");
  }

  return (
    <div className="flex flex-col gap-4">
      <RoleNotice cap="loyalty.release" />
      {items.length === 0 ? (
        <EmptyState title="No quest submissions waiting" body="Self-paced quests with a question grade themselves. Creative and community quests land here." />
      ) : (
        <Stagger className="grid gap-3 md:grid-cols-2">
          {items.map((p) => {
            const key = `${p.questId}-${p.creatorId}`;
            const q = s.quests.find((x) => x.id === p.questId);
            const cr = creatorOf(s, p.creatorId);
            const brand = q ? brandOf(s, q.brandId) : undefined;
            return (
              <StaggerItem key={key}>
                <article className="card flex h-full flex-col gap-3 p-4 sm:p-5">
                  <div className="flex items-center gap-3">
                    {cr && <Portrait c={cr} size={44} />}
                    <div className="min-w-0 flex-1">
                      <div className="font-display text-[16px] font-bold leading-tight">{q?.title}</div>
                      <div className="text-[13px] text-stone">{cr?.name}, {brand?.name}</div>
                    </div>
                    <Tag accent={brand?.accent}>{q?.kind}</Tag>
                  </div>
                  {p.submission && (
                    <div className="rounded-card bg-paper-2 p-3 text-[14px]">
                      <p className="leading-relaxed">{p.submission.text}</p>
                      <div className="mt-1.5 flex flex-wrap gap-2 text-[12.5px] text-stone">
                        {p.submission.fileName && <span className="font-mono">{p.submission.fileName}</span>}
                        <span>{fmtDateTime(p.submission.at, lang)}</span>
                        <SimTag>Placeholder file</SimTag>
                      </div>
                    </div>
                  )}
                  {allowed("loyalty.release") && (
                    <form
                      className="mt-auto flex flex-col gap-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (q) complete(p.questId, p.creatorId, q.points);
                      }}
                    >
                      <label className="label" htmlFor={`fb-${key}`}>Feedback for {cr?.name.split(" ")[0]}</label>
                      <textarea id={`fb-${key}`} className={cx("field", errors[key] && "field-error")} rows={2} value={notes[key] ?? ""} onChange={(e) => setNotes((n) => ({ ...n, [key]: e.target.value }))} placeholder="Lovely light. Next time hold the pack a second longer." />
                      {errors[key] && <p className="error-text" role="alert">{errors[key]}</p>}
                      <button type="submit" className="btn-grass btn-sm self-start" disabled={busy === key} aria-busy={busy === key}>
                        <CheckCircle size={16} weight="bold" /> {busy === key ? "Completing" : `Complete and release ${fmtPoints(q?.points ?? 0)}`}
                      </button>
                    </form>
                  )}
                </article>
              </StaggerItem>
            );
          })}
        </Stagger>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Balances                                                             */
/* ------------------------------------------------------------------ */
export function Balances({ s }: { s: AppState }) {
  const { t, lang } = useLang();
  const { actor, allowed } = useActor();
  const { toast } = useToast();
  const [open, setOpen] = useState<string | null>(null);
  const [adjusting, setAdjusting] = useState<string | null>(null);
  const [points, setPoints] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<{ points?: string; note?: string }>({});
  const [busy, setBusy] = useState(false);

  const rows = useMemo(() => s.creators.map((c) => ({ c, b: balances(s, c.id) })).sort((a, b) => b.b.available - a.b.available || a.c.name.localeCompare(b.c.name)), [s]);
  const target = adjusting ? creatorOf(s, adjusting) : undefined;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(points);
    const err: typeof errors = {};
    if (!points || !Number.isInteger(n) || n === 0) err.points = "Whole number, positive to add, negative to remove.";
    if (note.trim().length < 6) err.note = "The note is shown to the creator. Say why.";
    setErrors(err);
    if (Object.keys(err).length || !target) return;
    setBusy(true);
    await simulate(() => adjustPoints(target.id, n, note.trim(), actor));
    setBusy(false);
    setAdjusting(null);
    setPoints("");
    setNote("");
    toast(`${n > 0 ? "+" : ""}${fmtPoints(n)} for ${target.name.split(" ")[0]}`, "The creator sees the note in-app.");
  }

  return (
    <div className="flex flex-col gap-4">
      <RoleNotice cap="loyalty.adjust" />
      <div className="flex flex-col gap-2">
        {rows.map(({ c, b }) => {
          const entries = s.ledger.filter((l) => l.creatorId === c.id);
          return (
            <ExpandRow
              key={c.id}
              open={open === c.id}
              onToggle={() => setOpen(open === c.id ? null : c.id)}
              summary={
                <div className="flex items-center gap-3">
                  <Portrait c={c} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-[16px] font-bold leading-tight">{c.name}</div>
                    <div className="text-[12.5px] text-stone">{c.market}, {entries.length} ledger {entries.length === 1 ? "entry" : "entries"}</div>
                  </div>
                  <dl className="grid grid-cols-2 gap-x-4 text-end sm:grid-cols-4">
                    {[
                      ["Available", b.available],
                      ["Pending", b.pending],
                      ["Earned", b.earned],
                      ["Spent", b.spent],
                    ].map(([l, v], i) => (
                      <div key={l} className={cx(i > 1 && "hidden sm:block")}>
                        <dt className="text-[10.5px] font-semibold uppercase tracking-wide text-stone">{l}</dt>
                        <dd className={cx("font-display text-[16px] font-bold tabular", i === 0 && "text-grass")}>{fmtPoints(v as number)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              }
              actions={
                allowed("loyalty.adjust") ? (
                  <button type="button" className="btn-paper btn-sm" onClick={() => { setAdjusting(c.id); setErrors({}); }}>
                    Adjust
                  </button>
                ) : undefined
              }
            >
              {entries.length === 0 ? (
                <p className="text-[13.5px] text-stone">No ledger entries yet.</p>
              ) : (
                <ol className="divide-y divide-line">
                  {entries.map((l) => (
                    <li key={l.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-[14px]">
                      <Tag outline>{l.type}</Tag>
                      <span className="min-w-0 flex-1">{l.note}</span>
                      <span className="text-[12.5px] text-stone">{fmtDate(l.at, lang)}{l.type !== "spent" && !l.released ? ", pending" : ""}</span>
                      <span className={cx("font-display text-[16px] font-bold tabular", l.type === "spent" && "text-stone")}>{l.type === "spent" ? "-" : l.points > 0 ? "+" : ""}{fmtPoints(l.points)}</span>
                    </li>
                  ))}
                </ol>
              )}
            </ExpandRow>
          );
        })}
      </div>

      <Sheet
        open={!!adjusting}
        onClose={() => setAdjusting(null)}
        title={`Adjust ${target?.name.split(" ")[0] ?? ""}'s balance`}
        footer={
          <>
            <button type="button" className="btn-ghost" onClick={() => setAdjusting(null)}>{t.common.cancel}</button>
            <button type="submit" form="adjust-form" className="btn-ink" disabled={busy} aria-busy={busy}>{busy ? "Saving" : "Apply adjustment"}</button>
          </>
        }
      >
        <form id="adjust-form" onSubmit={submit} noValidate className="flex flex-col gap-4">
          {target && (
            <div className="flex items-center gap-3 rounded-card bg-paper-2 px-4 py-3 text-[14px]">
              <Portrait c={target} size={36} />
              <span>Available now <span className="font-display text-[18px] font-bold tabular">{fmtPoints(balances(s, target.id).available)}</span></span>
            </div>
          )}
          <div>
            <label className="label" htmlFor="adjust-points">Points</label>
            <input id="adjust-points" type="number" step={50} inputMode="numeric" className={cx("field tabular", errors.points && "field-error")} value={points} onChange={(e) => setPoints(e.target.value)} placeholder="250 or -250" />
            {errors.points ? <p className="error-text" role="alert">{errors.points}</p> : <p className="help">Positive adds, negative removes. Applied immediately as available points.</p>}
          </div>
          <div>
            <label className="label" htmlFor="adjust-note">Note to the creator</label>
            <textarea id="adjust-note" className={cx("field", errors.note && "field-error")} rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Goodwill for the courier delay on your Amla kit." />
            {errors.note && <p className="error-text" role="alert">{errors.note}</p>}
          </div>
        </form>
      </Sheet>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Rewards and stock                                                    */
/* ------------------------------------------------------------------ */
export function RewardStock({ s }: { s: AppState }) {
  const { actor, allowed } = useActor();
  const { toast } = useToast();
  const [drafts, setDrafts] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const canEdit = allowed("rewards.stock");

  const value = (r: Reward) => drafts[r.id] ?? r.stock;
  const setValue = (r: Reward, n: number) => setDrafts((d) => ({ ...d, [r.id]: Math.max(0, Math.round(n)) }));
  async function save(r: Reward) {
    setBusy(r.id);
    await simulate(() => updateRewardStock(r.id, value(r), actor));
    setBusy(null);
    setDrafts((d) => {
      const { [r.id]: _, ...rest } = d;
      void _;
      return rest;
    });
    toast(`${r.name}: ${value(r)} in stock`, undefined, "info");
  }

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <div className="card-paper grid items-center gap-4 overflow-hidden md:grid-cols-12">
          <div className="p-5 md:col-span-7 md:p-7">
            <h3 className="display-md">What points turn into</h3>
            <p className="mt-2 max-w-[46ch] text-[14.5px] text-stone">Product bundles, gear, learning and merch. Stock is tracked here and shown plainly to creators, sold-out items stay visible so nobody guesses.</p>
          </div>
          <Art id="rewardsFlatlay" alt="Paper-cut flat lay of reward products" className="aspect-[16/9] w-full md:col-span-5 md:aspect-auto md:h-full" fallback={<PaperScene accent="coral" />} />
        </div>
      </Reveal>
      <RoleNotice cap="rewards.stock" />
      <Stagger className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {s.rewards.map((r) => {
          const brand = r.brandId ? brandOf(s, r.brandId) : undefined;
          const out = r.stock === 0;
          const dirty = drafts[r.id] !== undefined && drafts[r.id] !== r.stock;
          return (
            <StaggerItem key={r.id}>
              <article className={cx("card flex h-full flex-col gap-3 p-4", out && "bg-paper")} aria-label={r.name}>
                <div className="flex items-start gap-3">
                  <div className="flex h-[72px] w-[56px] shrink-0 items-center justify-center rounded-input" style={{ background: ACCENT[r.accent].softHex }} aria-hidden>
                    {r.shape && brand ? <Pack shape={r.shape} accent={r.accent} label={packLabel(brand)} size={30} /> : <Gift size={26} weight="fill" className="text-ink" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-[16px] font-bold leading-tight">{r.name}</div>
                    <div className="mt-0.5 text-[13px] text-stone">{r.description}</div>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <Tag outline>{r.category}</Tag>
                      <span className="inline-flex items-center gap-1 text-[13px] font-semibold tabular"><Coins size={14} weight="fill" aria-hidden />{fmtPoints(r.points)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[13.5px] font-semibold">
                  {out ? <XCircle size={18} weight="fill" aria-hidden /> : <CheckCircle size={18} weight="fill" aria-hidden />}
                  {out ? "Out of stock" : `${r.stock} in stock`}
                  {out && <span className="font-normal text-stone">, shown as sold out to creators</span>}
                </div>
                {canEdit && (
                  <div className="mt-auto flex items-center gap-2">
                    <div className="inline-flex items-center rounded-pill border border-line bg-card" role="group" aria-label={`Stock for ${r.name}`}>
                      <button type="button" className="flex h-9 w-9 items-center justify-center rounded-pill hover:bg-paper-2" onClick={() => setValue(r, value(r) - 1)} aria-label="One fewer"><Minus size={14} weight="bold" /></button>
                      <input type="number" min={0} inputMode="numeric" className="w-14 border-0 bg-transparent text-center text-[14px] font-semibold tabular outline-none" value={value(r)} onChange={(e) => setValue(r, Number(e.target.value))} aria-label="Stock" />
                      <button type="button" className="flex h-9 w-9 items-center justify-center rounded-pill hover:bg-paper-2" onClick={() => setValue(r, value(r) + 1)} aria-label="One more"><Plus size={14} weight="bold" /></button>
                    </div>
                    <button type="button" className="btn-ink btn-sm" onClick={() => save(r)} disabled={!dirty || busy === r.id} aria-busy={busy === r.id}>{busy === r.id ? "Saving" : "Save"}</button>
                  </div>
                )}
              </article>
            </StaggerItem>
          );
        })}
      </Stagger>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Redemptions                                                          */
/* ------------------------------------------------------------------ */
export function Redemptions({ s }: { s: AppState }) {
  const { t, lang } = useLang();
  const list = [...s.redemptions].sort((a, b) => b.at.localeCompare(a.at));
  if (list.length === 0) return <EmptyState title="No redemptions yet" body="When a creator spends points, the order and its parcel show up here." />;
  return (
    <ul className="card divide-y divide-line">
      {list.map((r) => {
        const cr = creatorOf(s, r.creatorId);
        const rw = s.rewards.find((x) => x.id === r.rewardId);
        const sh = s.shipments.find((x) => x.id === r.shipmentId);
        return (
          <li key={r.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
            {cr && <Portrait c={cr} size={36} />}
            <div className="min-w-0 flex-1">
              <div className="font-semibold leading-tight">{cr?.name} <span className="font-normal text-stone">redeemed</span> {rw?.name ?? r.rewardId}</div>
              <div className="text-[12.5px] text-stone">{fmtDateTime(r.at, lang)}, {fmtPoints(r.points)} {t.common.pts}</div>
            </div>
            {sh && (
              <Link href="/admin/logistics" className="inline-flex items-center gap-1.5 rounded-pill border border-line px-3 py-1.5 text-[12.5px] font-semibold hover:bg-paper-2">
                {t.logistics[sh.status]} <ArrowSquareOut size={12} weight="bold" aria-hidden />
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Finance                                                              */
/* ------------------------------------------------------------------ */
export function Finance({ s }: { s: AppState }) {
  const { t } = useLang();
  const { allowed } = useActor();
  const data = useMemo(() => {
    let available = 0, pending = 0, spent = 0;
    const earnedBy: { c: AppState["creators"][number]; earned: number }[] = [];
    s.creators.forEach((c) => {
      const b = balances(s, c.id);
      available += b.available;
      pending += b.pending;
      spent += b.spent;
      earnedBy.push({ c, earned: b.earned });
    });
    const now = new Date();
    const releasedThisMonth = s.ledger
      .filter((l) => l.type === "earned" && l.released && l.releasedAt && new Date(l.releasedAt).getMonth() === now.getMonth() && new Date(l.releasedAt).getFullYear() === now.getFullYear())
      .reduce((a, l) => a + l.points, 0);
    return { available, pending, spent, releasedThisMonth, top: earnedBy.sort((a, b) => b.earned - a.earned).slice(0, 5) };
  }, [s]);

  if (!allowed("finance.view")) {
    return (
      <Notice>
        The points liability view is for Finance, Brand Managers and the Super Admin. Switch role from the menu to see it. <SimTag>{t.common.simulated}</SimTag>
      </Notice>
    );
  }
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Available, total liability" accent="coral" value={<Counter value={data.available} />} />
        <Stat label="Pending release" accent="amber" value={<Counter value={data.pending} />} />
        <Stat label="Released this month" accent="grass" value={<Counter value={data.releasedThisMonth} />} />
        <Stat label="Spent on rewards, all time" accent="sky" value={<Counter value={data.spent} />} />
      </div>
      <p className="text-[13px] text-stone">Liability is the sum of every creator&rsquo;s available balance. Pending is approved but not yet verified. One point has no cash value in this prototype.</p>
      <section aria-labelledby="top-title">
        <SectionTitle id="top-title" title="Top creators by points earned" />
        <ol className="card divide-y divide-line">
          {data.top.map(({ c, earned }, i) => (
            <li key={c.id} className="flex items-center gap-3 px-4 py-3">
              <span className="w-5 text-center font-display text-[15px] font-bold tabular text-stone">{i + 1}</span>
              <Portrait c={c} size={36} />
              <span className="min-w-0 flex-1 font-semibold">{c.name} <span className="font-normal text-stone">{c.market}</span></span>
              <span className="font-display text-[18px] font-bold tabular">{fmtPoints(earned)}</span>
            </li>
          ))}
        </ol>
      </section>
      <KV label="Method">Balances are recomputed from the ledger on every render. No cache, no rounding.</KV>
    </div>
  );
}
