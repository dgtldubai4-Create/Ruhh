"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bell, CalendarBlank, ChatCircle, Coins, Eye, Gift, ListChecks, Megaphone, SealCheck, ShieldCheck, Truck, UserPlus, type Icon } from "@phosphor-icons/react";
import { PageHeader } from "@/components/shell/portal-shell";
import { useAppState, useHydrated } from "@/lib/store/hooks";
import { balances, markNotificationsRead, STAGES } from "@/lib/store/actions";
import type { Capability } from "@/lib/store/permissions";
import { useLang } from "@/lib/i18n/provider";
import { cx, daysUntil, fmtDateTime, fmtPoints, timeAgo } from "@/lib/format";
import { Notice, SimTag, Stat, Tag, EmptyState } from "@/components/ui/primitives";
import { ACCENT } from "@/components/ui/accent";
import { Art, PaperScene } from "@/components/art/scenes";
import { Counter, Reveal, Stagger, StaggerItem } from "@/components/motion";
import { PageSkeleton, SectionTitle } from "@/components/admin/section";
import { Collapse } from "@/components/admin/expand-row";
import { useActor } from "@/components/admin/role-gate";
import { creatorOf, effectiveDeadline, plural, ROLE_BLURB, STAGE_ACCENT } from "@/components/admin/helpers";
import { Portrait } from "@/components/admin/creator-row";

type QueueItem = { id: string; cap: Capability; priority: number; icon: Icon; title: string; body: string; href: string };

export default function AdminOverview() {
  const s = useAppState();
  const hydrated = useHydrated();
  const { t, lang } = useLang();
  const { role, roleLabel, allowed } = useActor();
  const [queueAll, setQueueAll] = useState(false);
  const [feedAll, setFeedAll] = useState(false);
  const [openActivity, setOpenActivity] = useState<string | null>(null);

  const kpi = useMemo(() => {
    const byStage = Object.fromEntries(STAGES.map((st) => [st, s.campaigns.filter((c) => c.stage === st).length])) as Record<(typeof STAGES)[number], number>;
    const live = byStage.active + byStage.review + byStage.publishing;
    const verified = s.creators.filter((c) => c.verification === "verified").length;
    const pendingCreators = s.creators.filter((c) => c.verification === "pending").length;
    const waiting = s.submissions.filter((x) => x.status === "in_review").length;
    const transit = s.shipments.filter((x) => x.status !== "delivered").length;
    let pendingPts = 0, availablePts = 0;
    s.creators.forEach((c) => {
      const b = balances(s, c.id);
      pendingPts += b.pending;
      availablePts += b.available;
    });
    return { byStage, live, verified, pendingCreators, waiting, transit, pendingPts, availablePts };
  }, [s]);

  const queue = useMemo<QueueItem[]>(() => {
    const q: QueueItem[] = [];
    const name = (id: string) => creatorOf(s, id)?.name ?? "A creator";
    s.submissions.filter((x) => x.status === "in_review").forEach((x) => {
      const c = s.campaigns.find((k) => k.id === x.campaignId);
      q.push({ id: `sub-${x.id}`, cap: "review.decide", priority: 1, icon: Eye, title: `Review ${name(x.creatorId).split(" ")[0]}'s v${x.version}`, body: `${c?.title}. Simulated score ${x.score}.`, href: `/admin/review?campaign=${x.campaignId}` });
    });
    s.campaigns.filter((c) => c.stage !== "completed" && c.stage !== "draft" && daysUntil(effectiveDeadline(c)) < 0).forEach((c) => {
      q.push({ id: `late-${c.id}`, cap: "campaign.edit", priority: 1, icon: CalendarBlank, title: `Deadline passed on ${c.title}`, body: "Extend it or move the campaign on.", href: `/admin/campaigns/${c.id}` });
    });
    s.publications.filter((p) => p.verification === "pending").forEach((p) => {
      const c = s.campaigns.find((k) => k.id === p.campaignId);
      q.push({ id: `pub-${p.id}`, cap: "loyalty.release", priority: 2, icon: SealCheck, title: `Verify ${name(p.creatorId).split(" ")[0]}'s post`, body: `${c?.title} on ${p.platform}. ${fmtPoints(c?.points ?? 0)} points waiting.`, href: "/admin/loyalty" });
    });
    s.publications.filter((p) => p.verification === "verified" && !p.pointsReleased).forEach((p) => {
      const c = s.campaigns.find((k) => k.id === p.campaignId);
      q.push({ id: `rel-${p.id}`, cap: "loyalty.release", priority: 2, icon: Coins, title: `Release ${fmtPoints(c?.points ?? 0)} points to ${name(p.creatorId).split(" ")[0]}`, body: `${c?.title} is verified.`, href: "/admin/loyalty" });
    });
    s.participations.filter((p) => p.status === "in_review" || p.status === "submitted").forEach((p) => {
      const qu = s.quests.find((k) => k.id === p.questId);
      q.push({ id: `quest-${p.questId}-${p.creatorId}`, cap: "loyalty.release", priority: 3, icon: ListChecks, title: `Quest review: ${qu?.title}`, body: `${name(p.creatorId)} submitted. ${qu?.points ?? 0} points on completion.`, href: "/admin/loyalty?tab=quests" });
    });
    s.shipments.filter((x) => x.status !== "delivered").forEach((x) => {
      q.push({ id: `sh-${x.id}`, cap: "logistics.advance", priority: 4, icon: Truck, title: `${x.label} for ${name(x.creatorId).split(" ")[0]}`, body: `${t.logistics[x.status]}. Advance when the courier confirms.`, href: "/admin/logistics" });
    });
    s.campaigns.filter((c) => c.stage === "draft").forEach((c) => {
      q.push({ id: `draft-${c.id}`, cap: "creator.invite", priority: 5, icon: UserPlus, title: `Invite creators to ${c.title}`, body: "The draft has no invitations yet.", href: `/admin/campaigns/${c.id}` });
    });
    s.campaigns.filter((c) => c.stage === "inviting").forEach((c) => {
      const pending = c.invitations.filter((i) => i.status === "pending").length;
      if (pending) q.push({ id: `inv-${c.id}`, cap: "campaign.stage", priority: 6, icon: Megaphone, title: `${plural(pending, "reply", "replies")} pending on ${c.title}`, body: "Nudge or invite from the shortlist.", href: `/admin/campaigns/${c.id}` });
    });
    s.creators.filter((c) => c.verification === "pending").forEach((c) => {
      q.push({ id: `ver-${c.id}`, cap: "creator.verify", priority: 5, icon: ShieldCheck, title: `Verify ${c.name}`, body: `${c.city}, ${c.market}. Licence ${c.licenceId} (prototype).`, href: "/admin/creators?verification=pending" });
    });
    s.rewards.filter((r) => r.stock === 0).forEach((r) => {
      q.push({ id: `stock-${r.id}`, cap: "rewards.stock", priority: 6, icon: Gift, title: `${r.name} is out of stock`, body: "Restock or leave it visible as sold out.", href: "/admin/loyalty?tab=rewards" });
    });
    return q.filter((x) => allowed(x.cap)).sort((a, b) => a.priority - b.priority);
  }, [s, allowed, t]);

  if (!hydrated) return <PageSkeleton rows={4} />;

  const adminNotes = s.notifications.filter((n) => n.audience === "admin");
  const unread = adminNotes.filter((n) => !n.read).length;
  const queueShown = queueAll ? queue : queue.slice(0, 6);
  const feed = s.activity;
  const feedShown = feedAll ? feed : feed.slice(0, 6);

  return (
    <div className="flex flex-col gap-10">
      <div className="grid items-center gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <PageHeader title="Where the Squad stands" lede={`${plural(kpi.waiting, "cut")} waiting for review, ${plural(kpi.transit, "parcel")} moving, ${plural(s.publications.filter((p) => p.verification === "pending").length, "post")} to verify.`}>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Tag accent="grass">{t.admin.role}: {roleLabel}</Tag>
              <SimTag>{t.common.simulated}</SimTag>
            </div>
            <p className="mt-2 max-w-[60ch] text-[14px] text-stone">{ROLE_BLURB[role]}</p>
          </PageHeader>
        </div>
        <Reveal className="lg:col-span-5" delay={0.1}>
          <div className="card-paper overflow-hidden rotate-[-1deg]">
            <Art id="brandTeam" alt="Paper-cut brand team around a table of product packs" className="aspect-[16/10] w-full" fallback={<PaperScene accent="grass" />} />
          </div>
        </Reveal>
      </div>

      {/* KPIs */}
      <section aria-labelledby="kpi-title">
        <SectionTitle id="kpi-title" title="This week in numbers" eyebrow="Pulse" />
        <Stagger className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {[
            { label: "Live campaigns", value: kpi.live, accent: "grass" as const },
            { label: "Creators, verified", value: kpi.verified, accent: "sun" as const, sub: `${s.creators.length} total, ${kpi.pendingCreators} pending` },
            { label: "Cuts waiting", value: kpi.waiting, accent: "berry" as const },
            { label: "Parcels moving", value: kpi.transit, accent: "sky" as const },
            { label: "Points pending release", value: kpi.pendingPts, accent: "amber" as const },
            { label: "Points available, liability", value: kpi.availablePts, accent: "coral" as const },
          ].map((k) => (
            <StaggerItem key={k.label}>
              <Stat label={k.label} accent={k.accent} value={<Counter value={k.value} />} />
              {k.sub && <div className="mt-1 ps-1 text-[12px] text-stone">{k.sub}</div>}
            </StaggerItem>
          ))}
        </Stagger>
        <div className="mt-3 flex flex-wrap gap-2">
          {STAGES.map((st) => (
            <Link key={st} href="/admin/campaigns" className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-card px-3 py-1.5 text-[13px] hover:bg-paper-2">
              <span className={cx("h-2 w-2 rounded-full", ACCENT[STAGE_ACCENT[st]].bg)} aria-hidden />
              {t.stages[st]} <span className="font-semibold tabular">{kpi.byStage[st]}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Needs you */}
        <section className="lg:col-span-7" aria-labelledby="queue-title">
          <SectionTitle id="queue-title" title="Needs you" count={queue.length} eyebrow="Queue" />
          {queue.length === 0 ? (
            <EmptyState title="Nothing waiting on this role" body={`${roleLabel} has an empty queue. Switch role from the menu to see what others are holding.`} />
          ) : (
            <>
              <Stagger as="ol" className="flex flex-col gap-2">
                {queueShown.map((q) => (
                  <StaggerItem key={q.id} as="li">
                    <Link href={q.href} className="card card-lift flex items-center gap-3 px-4 py-3 hover:border-ink">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-input bg-paper-2" aria-hidden>
                        <q.icon size={20} weight="fill" className="text-ink" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-semibold leading-tight">{q.title}</span>
                        <span className="block truncate text-[13px] text-stone">{q.body}</span>
                      </span>
                      <ArrowRight size={18} weight="bold" className="shrink-0 text-stone rtl:rotate-180" aria-hidden />
                    </Link>
                  </StaggerItem>
                ))}
              </Stagger>
              {queue.length > 6 && (
                <button type="button" className="btn-ghost btn-sm mt-2" onClick={() => setQueueAll((v) => !v)} aria-expanded={queueAll}>
                  {queueAll ? "Show fewer" : `Show ${queue.length - 6} more`}
                </button>
              )}
            </>
          )}
        </section>

        {/* Notifications */}
        <section className="lg:col-span-5" aria-labelledby="notes-title">
          <SectionTitle
            id="notes-title"
            title={<span className="inline-flex items-center gap-2"><Bell size={20} weight="fill" aria-hidden /> {t.common.inbox}</span>}
            count={unread}
            aside={
              <button type="button" className="btn-paper btn-sm" onClick={() => markNotificationsRead("admin")} disabled={!unread}>
                {t.common.markAllRead}
              </button>
            }
          />
          {adminNotes.length === 0 ? (
            <Notice>Nothing has landed for the brand team yet.</Notice>
          ) : (
            <ul className="flex flex-col gap-2">
              {adminNotes.slice(0, 4).map((n) => (
                <li key={n.id}>
                  <Link href={n.href ?? "/admin"} className={cx("card block px-4 py-3 hover:bg-paper-2", !n.read && "border-ink")}>
                    <div className="flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-wide text-stone">
                      {n.channel === "email" ? t.common.email : t.common.inApp}
                      {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-ink" aria-label="Unread" />}
                      <span className="ms-auto normal-case tracking-normal">{timeAgo(n.at)}</span>
                    </div>
                    <div className={cx("mt-1 text-[14.5px]", !n.read && "font-semibold")}>{n.title}</div>
                    <div className="mt-0.5 text-[13px] text-stone">{n.body}</div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {adminNotes.length > 4 && <p className="mt-2 text-[13px] text-stone">{adminNotes.length - 4} older in the inbox drawer, top right.</p>}
        </section>
      </div>

      {/* Activity */}
      <section aria-labelledby="feed-title">
        <SectionTitle id="feed-title" title="What happened" count={feed.length} eyebrow="Activity" />
        <ol className="card divide-y divide-line">
          {feedShown.map((a) => {
            const creator = s.creators.find((c) => c.name === a.actor);
            const open = openActivity === a.id;
            return (
              <li key={a.id}>
                <button type="button" className="flex w-full items-start gap-3 px-4 py-3 text-start hover:bg-paper-2 sm:px-5" aria-expanded={open} onClick={() => setOpenActivity(open ? null : a.id)}>
                  {creator ? <Portrait c={creator} size={36} /> : <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-card" aria-hidden><ChatCircle size={18} weight="fill" /></span>}
                  <span className="min-w-0 flex-1 text-[14.5px] leading-snug">
                    <span className="font-semibold">{a.actor}</span> {a.text}
                  </span>
                  <span className="shrink-0 text-[12.5px] text-stone">{timeAgo(a.at)}</span>
                </button>
                <Collapse open={open}>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 pb-3 ps-16 text-[13px] text-stone sm:px-5 sm:ps-[68px]">
                    <span>{fmtDateTime(a.at, lang)}</span>
                    <span>{creator ? `Creator, ${creator.city}` : "Brand team"}</span>
                    {creator && <Link href="/admin/creators" className="font-semibold text-ink underline underline-offset-4">Open profile</Link>}
                  </div>
                </Collapse>
              </li>
            );
          })}
        </ol>
        {feed.length > 6 && (
          <button type="button" className="btn-ghost btn-sm mt-2" onClick={() => setFeedAll((v) => !v)} aria-expanded={feedAll}>
            {feedAll ? "Show recent only" : `Show ${feed.length - 6} earlier`}
          </button>
        )}
      </section>
    </div>
  );
}
