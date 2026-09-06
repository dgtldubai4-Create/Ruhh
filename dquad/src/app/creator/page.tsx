"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarBlank, ChatCircleDots, CheckCircle, Compass, Envelope, HourglassMedium, Megaphone, PencilSimple, ShareNetwork, Sparkle, UploadSimple } from "@phosphor-icons/react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { Art, PaperScene, PointsCoin, Sticker } from "@/components/art/scenes";
import { Pack } from "@/components/art/pack";
import { EmptyState, SimTag, Steps, Tag } from "@/components/ui/primitives";
import { ACCENT } from "@/components/ui/accent";
import { useHydrated } from "@/lib/store/hooks";
import { balances } from "@/lib/store/actions";
import { useLang } from "@/lib/i18n/provider";
import { cx, daysUntil, fmtDate, fmtPoints, timeAgo } from "@/lib/format";
import type { Campaign } from "@/lib/store/types";
import { useCreator, campaignJourney, brandOf, effectiveDeadline, deadlineLabel, JOURNEY_STEPS, packLabel, firstProductOf } from "@/components/creator/helpers";
import { CampaignCard } from "@/components/creator/campaign-card";
import { InvitationSheet, type InvitationDecision } from "@/components/creator/invitation-sheet";
import { ShipmentTracker } from "@/components/creator/shipment-tracker";
import { SectionTitle } from "@/components/creator/section";

type NextAction = { kind: "invitation" | "changes" | "publish" | "quest"; title: string; body: string; href: string; cta: string; icon: typeof Envelope; accent: "coral" | "sun" | "mint" | "sky" };

export default function CreatorHome() {
  const { s, creator, creatorId } = useCreator();
  const { t, lang, dir } = useLang();
  const hydrated = useHydrated();
  const [request, setRequest] = useState<InvitationDecision | null>(null);

  const hour = hydrated ? new Date().getHours() : 9;
  const greeting = t.creator.greeting[hour < 12 ? 0 : hour < 18 ? 1 : 2];
  const firstName = creator.name.split(" ")[0];
  const bal = balances(s, creatorId);

  const mine = useMemo(() => s.campaigns.filter((c) => c.invitations.some((i) => i.creatorId === creatorId)).map((c) => ({ c, j: campaignJourney(s, c, creatorId) })), [s, creatorId]);
  const invitations = mine.filter((x) => x.j.pending);
  const active = mine.filter((x) => x.j.accepted && !x.j.complete);
  const participations = s.participations.filter((p) => p.creatorId === creatorId);
  const joinedQuests = participations.filter((p) => p.status === "joined").map((p) => s.quests.find((q) => q.id === p.questId)).filter(Boolean);

  const next: NextAction | null = (() => {
    const inv = invitations[0];
    if (inv) return { kind: "invitation", title: `${inv.c.title} is waiting for your answer`, body: `${brandOf(s, inv.c.brandId)?.name ?? "A brand team"} sent the brief ${timeAgo(inv.j.invitation?.sentAt ?? inv.c.createdAt)}. Read it and decide, no pressure either way.`, href: `/creator/campaigns/${inv.c.id}`, cta: "Read the brief", icon: Envelope, accent: "coral" };
    const ch = active.find((x) => x.j.latest?.status === "changes_requested");
    if (ch) return { kind: "changes", title: `One more pass on ${ch.c.title}`, body: `The reviewer left notes on v${ch.j.latest?.version}. A small re-cut and you are through.`, href: `/creator/campaigns/${ch.c.id}`, cta: "See the notes", icon: PencilSimple, accent: "sun" };
    const pub = active.find((x) => x.j.latest?.status === "approved" && !x.j.publication);
    if (pub) return { kind: "publish", title: `${pub.c.title} is approved, publish it`, body: `Post it and paste the live link. ${fmtPoints(pub.c.points)} points move to pending release the moment we have it.`, href: `/creator/campaigns/${pub.c.id}`, cta: "Paste the link", icon: ShareNetwork, accent: "mint" };
    const q = joinedQuests[0];
    if (q) return { kind: "quest", title: `Finish ${q.title}`, body: `You joined this side quest and it is still open. ${fmtPoints(q.points)} points for a few minutes of your time.`, href: "/creator/quests", cta: "Open the quest", icon: Compass, accent: "sky" };
    return null;
  })();

  const deadlines = useMemo(() => {
    const items: { id: string; title: string; sub: string; at: string; href: string }[] = [];
    active.forEach((x) => items.push({ id: x.c.id, title: x.c.title, sub: "Campaign deliverable", at: effectiveDeadline(x.c), href: `/creator/campaigns/${x.c.id}` }));
    invitations.forEach((x) => items.push({ id: `inv-${x.c.id}`, title: x.c.title, sub: "Invitation open, deadline if you join", at: effectiveDeadline(x.c), href: `/creator/campaigns/${x.c.id}` }));
    joinedQuests.forEach((q) => q && items.push({ id: q.id, title: q.title, sub: "Side quest", at: q.deadline, href: "/creator/quests" }));
    return items.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()).slice(0, 5);
  }, [active, invitations, joinedQuests]);

  const shipments = s.shipments.filter((sh) => sh.creatorId === creatorId).sort((a, b) => (a.status === "delivered" ? 1 : 0) - (b.status === "delivered" ? 1 : 0));

  const feedback = useMemo(() => {
    const items: { id: string; author: string; text: string; at: string; context: string; href: string }[] = [];
    s.submissions
      .filter((x) => x.creatorId === creatorId)
      .forEach((sub) => {
        const c = s.campaigns.find((cc) => cc.id === sub.campaignId);
        sub.comments.filter((cm) => cm.role === "reviewer").forEach((cm) => items.push({ id: cm.id, author: cm.author, text: cm.text, at: cm.at, context: `${c?.title ?? "Campaign"}, v${sub.version}`, href: `/creator/campaigns/${sub.campaignId}` }));
      });
    participations.forEach((p) => {
      if (!p.feedback) return;
      const q = s.quests.find((qq) => qq.id === p.questId);
      items.push({ id: `pf-${p.questId}`, author: "Squad team", text: p.feedback, at: p.submission?.at ?? p.joinedAt, context: q?.title ?? "Side quest", href: "/creator/quests" });
    });
    return items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 3);
  }, [s, creatorId, participations]);

  const recommended = s.quests.filter((q) => !participations.some((p) => p.questId === q.id)).slice(0, 3);
  const Arrow = <ArrowRight size={16} weight="bold" className={dir === "rtl" ? "rotate-180" : ""} />;

  return (
    <div className="flex flex-col gap-10 sm:gap-12">
      {/* Greeting and points */}
      <section className="grid items-stretch gap-5 lg:grid-cols-12" aria-label="Welcome">
        <Reveal className="flex flex-col justify-between gap-6 lg:col-span-7" y={16} amount={0.05}>
          <div>
            <p className="eyebrow mb-2">{fmtDate(new Date().toISOString(), lang)}, {creator.city}</p>
            <h1 className="display-lg text-balance">
              {greeting}, {firstName}.
            </h1>
            <p className="lede mt-3 max-w-[50ch]">
              {invitations.length > 0
                ? `${invitations.length === 1 ? "One brief is" : `${invitations.length} briefs are`} waiting for you, ${active.length} campaign${active.length === 1 ? "" : "s"} in motion, and a parcel on its way.`
                : active.length > 0
                  ? `${active.length} campaign${active.length === 1 ? "" : "s"} in motion. Keep going, the reviewers are quick this week.`
                  : "A quiet week. Good time to pick up a side quest."}
            </p>
          </div>

          <div className="relative flex flex-wrap items-center gap-5 rounded-card border-2 border-ink bg-card p-5 sm:gap-8" style={{ boxShadow: "6px 6px 0 0 var(--color-ink)" }}>
            <PointsCoin size={64} />
            <div>
              <div className="text-[12.5px] font-semibold text-stone">{t.creator.availablePts}</div>
              <div className="font-display text-[36px] font-bold leading-none tabular text-grass">{fmtPoints(bal.available)}</div>
            </div>
            <div>
              <div className="text-[12.5px] font-semibold text-stone">{t.creator.pendingPts}</div>
              <div className="font-display text-[36px] font-bold leading-none tabular">{fmtPoints(bal.pending)}</div>
            </div>
            <div className="ms-auto flex flex-col items-end gap-2">
              <Link href="/creator/rewards" className="btn-paper btn-sm">
                Spend or track {Arrow}
              </Link>
              <span className="text-[11.5px] text-stone">{fmtPoints(bal.earned)} earned all time</span>
            </div>
          </div>
        </Reveal>

        <Reveal className="lg:col-span-5" delay={0.1} y={16} amount={0.05}>
          <div className="relative mx-auto max-w-[420px] lg:max-w-none">
            <div className="card-paper overflow-hidden rotate-[1.5deg]">
              <Art id="portraitLayla" alt={`Paper-cut portrait of ${creator.name}`} priority className="aspect-[4/3] w-full" fallback={<PaperScene accent={creator.avatar.tone} />} />
            </div>
            <Sticker accent="sun" rotate={-6} className="absolute -start-2 -top-3">
              <Sparkle size={14} weight="fill" /> {creator.handle}
            </Sticker>
            {creator.verification === "verified" && (
              <Sticker accent="mint" rotate={4} className="absolute -bottom-3 end-4">
                <CheckCircle size={14} weight="fill" /> Verified
              </Sticker>
            )}
          </div>
        </Reveal>
      </section>

      {/* Next best action */}
      {next && (
        <Reveal amount={0.1}>
          <SectionTitle title={t.creator.nextBest} />
          <Link href={next.href} className="card-lift group flex flex-col gap-4 rounded-card border-2 border-ink p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6" style={{ background: ACCENT[next.accent].softHex, boxShadow: "6px 6px 0 0 var(--color-ink)" }}>
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-ink" style={{ background: ACCENT[next.accent].hex, boxShadow: "3px 3px 0 0 var(--color-ink)" }} aria-hidden>
              <next.icon size={26} weight="fill" className="text-ink" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="display-sm text-balance">{next.title}</div>
              <p className="mt-1 max-w-[60ch] text-[14px] text-ink/80">{next.body}</p>
            </div>
            <span className="btn-ink btn-sm shrink-0 self-start sm:self-center">
              {next.cta} {Arrow}
            </span>
          </Link>
        </Reveal>
      )}

      {/* Invitations */}
      {invitations.length > 0 && (
        <section aria-labelledby="inv-title">
          <SectionTitle title={<span id="inv-title">{t.creator.invitations}</span>} href="/creator/campaigns" />
          <Stagger className="grid gap-5 md:grid-cols-2">
            {invitations.map(({ c }) => (
              <StaggerItem key={c.id}>
                <CampaignCard s={s} campaign={c} creatorId={creatorId} onAccept={(cc) => setRequest({ campaign: cc, decision: "accepted" })} onDecline={(cc) => setRequest({ campaign: cc, decision: "declined" })} />
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}

      {/* Active campaigns */}
      <section aria-labelledby="active-title">
        <SectionTitle title={<span id="active-title">{t.creator.active}</span>} href="/creator/campaigns" />
        {active.length === 0 ? (
          <EmptyState title="Nothing in motion" body="Accept an invitation and it shows up here with its progress." action={<Link href="/creator/campaigns" className="btn-ink btn-sm">See campaigns</Link>} />
        ) : (
          <Stagger className="grid gap-4 md:grid-cols-2">
            {active.map(({ c, j }) => (
              <StaggerItem key={c.id}>
                <ActiveRow c={c} current={j.current} line={journeyStatus(j.current, j.latest?.version)} />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-6">
        {/* Deadlines */}
        <section aria-labelledby="dl-title">
          <SectionTitle title={<span id="dl-title">{t.creator.deadlines}</span>} />
          {deadlines.length === 0 ? (
            <EmptyState title="No dates on the horizon" body="Deadlines from campaigns and quests you join appear here." />
          ) : (
            <Stagger as="ul" className="card divide-y divide-line">
              {deadlines.map((d) => {
                const days = daysUntil(d.at);
                return (
                  <StaggerItem key={d.id} as="li">
                    <Link href={d.href} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-paper-2 first:rounded-t-card last:rounded-b-card">
                      <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-input bg-paper-2 leading-none" aria-hidden>
                        <span className="font-display text-[17px] font-bold">{new Date(d.at).getDate()}</span>
                        <span className="text-[10px] font-semibold uppercase text-stone">{new Intl.DateTimeFormat("en-GB", { month: "short" }).format(new Date(d.at))}</span>
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[14.5px] font-semibold">{d.title}</div>
                        <div className="text-[12.5px] text-stone">{d.sub}</div>
                      </div>
                      <span className={cx("shrink-0 text-[12.5px] font-semibold", days <= 3 ? "text-ink" : "text-stone")}>{deadlineLabel(d.at)}</span>
                    </Link>
                  </StaggerItem>
                );
              })}
            </Stagger>
          )}
        </section>

        {/* Deliveries */}
        <section aria-labelledby="del-title">
          <SectionTitle title={<span id="del-title">{t.creator.deliveries}</span>} href="/creator/rewards#deliveries" linkLabel="Track all" />
          {shipments.length === 0 ? (
            <EmptyState title="No parcels yet" body="Product kits and rewards you redeem are tracked here." />
          ) : (
            <Stagger className="flex flex-col gap-3">
              {shipments.slice(0, 2).map((sh) => (
                <StaggerItem key={sh.id}>
                  <ShipmentTracker shipment={sh} compact />
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </section>

        {/* Feedback */}
        <section aria-labelledby="fb-title">
          <SectionTitle title={<span id="fb-title">{t.creator.feedback}</span>} />
          {feedback.length === 0 ? (
            <EmptyState title="No notes yet" body="Reviewer comments on your cuts and quest feedback collect here." />
          ) : (
            <Stagger as="ul" className="flex flex-col gap-3">
              {feedback.map((f) => (
                <StaggerItem key={f.id} as="li">
                  <Link href={f.href} className="card card-lift block p-4">
                    <div className="flex items-center gap-2 text-[12px] font-semibold text-stone">
                      <ChatCircleDots size={15} weight="fill" className="text-ink" />
                      {f.author} on {f.context}
                      <span className="ms-auto font-normal">{timeAgo(f.at)}</span>
                    </div>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-ink">{f.text}</p>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </section>

        {/* Recommended quests */}
        <section aria-labelledby="rq-title">
          <SectionTitle title={<span id="rq-title">{t.creator.recommended}</span>} href="/creator/quests" />
          {recommended.length === 0 ? (
            <EmptyState title="You have joined every open quest" body="New ones land every few weeks." />
          ) : (
            <Stagger as="ul" className="flex flex-col gap-3">
              {recommended.map((q) => {
                const b = brandOf(s, q.brandId);
                return (
                  <StaggerItem key={q.id} as="li">
                    <Link href="/creator/quests" className="card card-lift flex items-center gap-4 p-4">
                      <div className="flex h-[76px] w-[56px] shrink-0 items-end justify-center overflow-hidden rounded-input" style={{ background: ACCENT[b?.accent ?? "grass"].softHex }}>
                        <Pack shape={b?.packShape} accent={b?.accent} label={packLabel(b)} size={40} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-[14.5px] font-semibold">{q.title}</span>
                          <Tag accent={b?.accent} className="capitalize">{q.kind}</Tag>
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-[13px] text-stone">{q.description}</p>
                      </div>
                      <span className="shrink-0 font-display text-[16px] font-bold tabular">+{fmtPoints(q.points)}</span>
                    </Link>
                  </StaggerItem>
                );
              })}
            </Stagger>
          )}
        </section>
      </div>

      <p className="text-center text-[12px] text-stone">
        <SimTag>{t.common.simulated}</SimTag> <span className="ms-2">{t.hero.note}</span>
      </p>

      <InvitationSheet request={request} creator={creator} onClose={() => setRequest(null)} />
    </div>
  );
}

function journeyStatus(current: number, version?: number): { icon: typeof UploadSimple; text: string } {
  if (current >= 8) return { icon: CheckCircle, text: "Points released" };
  if (current === 7) return { icon: HourglassMedium, text: "Verified, points releasing" };
  if (current === 6) return { icon: HourglassMedium, text: "Link received, verification pending" };
  if (current === 5) return { icon: ShareNetwork, text: "Approved, publish and paste the link" };
  if (current === 4) return { icon: ChatCircleDots, text: version ? `v${version} in feedback` : "In feedback" };
  if (current === 3) return { icon: UploadSimple, text: "Script saved, upload your cut" };
  return { icon: Megaphone, text: "Brief open, film when ready" };
}

function ActiveRow({ c, current, line }: { c: Campaign; current: number; line: { icon: typeof UploadSimple; text: string } }) {
  const { s } = useCreator();
  const { t, lang } = useLang();
  const b = brandOf(s, c.brandId);
  const product = firstProductOf(s, c);
  const accent = b?.accent ?? "grass";
  return (
    <Link href={`/creator/campaigns/${c.id}`} className="card card-lift flex gap-4 p-4 sm:p-5">
      <div className="flex h-[96px] w-[72px] shrink-0 items-end justify-center overflow-hidden rounded-input" style={{ background: ACCENT[accent].softHex }} aria-hidden>
        <Pack shape={b?.packShape} accent={accent} label={packLabel(b)} sub={product?.type.toLowerCase()} size={50} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[12px] font-semibold text-stone">{b?.name}</span>
          <Tag accent={accent}>{t.stages[c.stage]}</Tag>
        </div>
        <div className="display-sm mt-1 truncate">{c.title}</div>
        <div className="mt-1 flex items-center gap-1.5 text-[13px] text-ink">
          <line.icon size={15} weight="fill" /> {line.text}
        </div>
        <div className="mt-3">
          <Steps steps={[...JOURNEY_STEPS]} current={current} accent={accent} compact />
        </div>
        <div className="mt-1.5 flex justify-between text-[11.5px] text-stone">
          <span>
            {JOURNEY_STEPS[Math.min(current, 7)]}, {Math.min(current + 1, 8)} of 8
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarBlank size={12} weight="bold" /> {fmtDate(effectiveDeadline(c), lang)}
          </span>
        </div>
      </div>
    </Link>
  );
}
