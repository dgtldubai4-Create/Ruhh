"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowSquareOut, CalendarPlus, CheckCircle, Coins, Hourglass, PaperPlaneTilt, PencilSimple, Star, Trash, UserPlus, XCircle } from "@phosphor-icons/react";
import { PageHeader } from "@/components/shell/portal-shell";
import { useAppState, useHydrated } from "@/lib/store/hooks";
import { deleteCampaign, extendDeadline, inviteCreator, setCampaignStage, simulate, STAGES } from "@/lib/store/actions";
import type { CampaignStage, InvitationStatus } from "@/lib/store/types";
import { useLang } from "@/lib/i18n/provider";
import { cx, daysUntil, fmtDate, fmtDateLong, fmtPoints } from "@/lib/format";
import { ACCENT } from "@/components/ui/accent";
import { EmptyState, Notice, SimTag, Steps, Tag } from "@/components/ui/primitives";
import { Drawer, Sheet, useToast } from "@/components/ui/overlays";
import { Pack } from "@/components/art/pack";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { PageSkeleton, SectionTitle, KV } from "@/components/admin/section";
import { CampaignForm } from "@/components/admin/campaign-form";
import { RoleNotice, useActor } from "@/components/admin/role-gate";
import { StageTag } from "@/components/admin/stage-board";
import { Portrait, VerificationMark } from "@/components/admin/creator-row";
import { StatusMark } from "@/components/admin/review-row";
import { brandOf, creatorOf, effectiveDeadline, fromDateInput, invitationSummary, matchFor, maxFollowers, packLabel, PLATFORM_LABELS, STAGE_ACCENT, toDateInput } from "@/components/admin/helpers";
import { fmtFollowers } from "@/lib/format";

const INV_ICON: Record<InvitationStatus, typeof CheckCircle> = { accepted: CheckCircle, pending: Hourglass, declined: XCircle };

export default function CampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const s = useAppState();
  const hydrated = useHydrated();
  const { t, lang, dir } = useLang();
  const { actor, allowed } = useActor();
  const { toast } = useToast();

  const c = s.campaigns.find((x) => x.id === params.id);
  const [edit, setEdit] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [extending, setExtending] = useState(false);
  const [newDeadline, setNewDeadline] = useState("");
  const [deadlineError, setDeadlineError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const candidates = useMemo(() => {
    if (!c) return [];
    return s.creators
      .filter((cr) => !c.invitations.some((i) => i.creatorId === cr.id))
      .map((cr) => ({ cr, match: matchFor(s, cr, c) }))
      .sort((a, b) => Number(!!b.cr.shortlisted) - Number(!!a.cr.shortlisted) || b.match - a.match);
  }, [s, c]);

  if (!hydrated) return <PageSkeleton rows={3} />;
  if (!c) {
    return (
      <EmptyState
        title="No campaign with that id"
        body="It may have been deleted as a draft, or the link is from an older demo state."
        action={<Link href="/admin/campaigns" className="btn-paper btn-sm">{t.common.back} to {t.admin.campaigns.toLowerCase()}</Link>}
      />
    );
  }

  const brand = brandOf(s, c.brandId);
  const accent = brand?.accent ?? "grass";
  const products = c.productIds.map((id) => s.products.find((p) => p.id === id)).filter(Boolean);
  const stageIndex = STAGES.indexOf(c.stage);
  const next = STAGES[stageIndex + 1] as CampaignStage | undefined;
  const inv = invitationSummary(c);
  const deadline = effectiveDeadline(c);
  const days = daysUntil(deadline);
  const subs = s.submissions.filter((x) => x.campaignId === c.id && x.version > 0).sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  const pubs = s.publications.filter((x) => x.campaignId === c.id);
  const BackArrow = dir === "rtl" ? ArrowRight : ArrowLeft;

  async function moveTo(stage: CampaignStage) {
    if (stage === c!.stage) return;
    setBusy("stage");
    await simulate(() => setCampaignStage(c!.id, stage, actor), 300);
    setBusy(null);
    toast(`Moved to ${t.stages[stage]}`, c!.title, "info");
  }
  async function extend() {
    if (!newDeadline) {
      setDeadlineError("Pick a new date.");
      return;
    }
    const iso = fromDateInput(newDeadline);
    if (new Date(iso).getTime() <= new Date(deadline).getTime()) {
      setDeadlineError("The new date has to be after the current deadline.");
      return;
    }
    setDeadlineError("");
    setBusy("extend");
    await simulate(() => extendDeadline(c!.id, iso, actor));
    setBusy(null);
    setExtending(false);
    setNewDeadline("");
    toast("Deadline extended", `${inv.accepted} accepted ${inv.accepted === 1 ? "creator gets" : "creators get"} a simulated in-app note.`);
  }
  async function invite(creatorId: string) {
    setBusy(`inv-${creatorId}`);
    await simulate(() => inviteCreator(c!.id, creatorId, actor));
    setBusy(null);
    toast(`${creatorOf(s, creatorId)?.name.split(" ")[0]} invited`, "They get a simulated in-app notification with the brief.");
  }
  async function remove() {
    setBusy("delete");
    await simulate(() => deleteCampaign(c!.id, actor));
    toast("Draft deleted", c!.title, "info");
    router.push("/admin/campaigns");
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/admin/campaigns" className="inline-flex items-center gap-1 text-[13.5px] font-semibold text-stone hover:text-ink">
          <BackArrow size={16} weight="bold" /> {t.admin.campaigns}
        </Link>
        <div className="mt-3 grid gap-6 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-8">
            <PageHeader
              title={c.title}
              aside={
                <>
                  {allowed("campaign.edit") && (
                    <button type="button" className="btn-paper btn-sm" onClick={() => setEdit(true)}>
                      <PencilSimple size={16} weight="bold" /> {t.common.edit}
                    </button>
                  )}
                  {allowed("campaign.edit") && c.stage === "draft" && (
                    <button type="button" className="btn-ghost btn-sm" onClick={() => setConfirmDelete(true)}>
                      <Trash size={16} weight="bold" /> {t.common.delete} draft
                    </button>
                  )}
                </>
              }
            >
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Tag accent={accent}>{brand?.name}</Tag>
                <StageTag stage={c.stage} />
                {c.markets.map((m) => (
                  <Tag key={m} outline>{m}</Tag>
                ))}
                <span className="text-[13px] text-stone">Owner {c.ownerName}, created {fmtDate(c.createdAt, lang)}</span>
              </div>
            </PageHeader>
          </div>
          <Reveal className="lg:col-span-4" delay={0.05}>
            <div className="card-paper flex items-center justify-around gap-2 p-4" style={{ background: ACCENT[accent].softHex }}>
              {products.slice(0, 3).map((p, i) => (
                <div key={p!.id} className="anim-float" style={{ ["--rot" as string]: `${-6 + i * 6}deg`, animationDelay: `${i * 0.5}s` }}>
                  <Pack shape={brand?.packShape} accent={accent} label={brand ? packLabel(brand) : ""} sub={p!.type.toLowerCase()} size={64} />
                </div>
              ))}
              {products.length === 0 && <span className="text-[13px] text-stone">No products picked yet</span>}
            </div>
          </Reveal>
        </div>
      </div>

      {/* stage stepper */}
      <section className="card p-4 sm:p-5" aria-labelledby="stage-title">
        <SectionTitle id="stage-title" title="Stage" aside={<span className="text-[13px] text-stone">{stageIndex + 1} of {STAGES.length}</span>} />
        <Steps steps={STAGES.map((st) => t.stages[st])} current={stageIndex} accent={STAGE_ACCENT[c.stage]} />
        <ol className="mt-2 hidden grid-cols-6 gap-2 text-[12px] md:grid">
          {STAGES.map((st, i) => (
            <li key={st} className={cx(i === stageIndex ? "font-bold text-ink" : i < stageIndex ? "text-ink" : "text-stone")}>{t.stages[st]}</li>
          ))}
        </ol>
        <div className="mt-4 flex flex-col gap-3">
          {allowed("campaign.stage") ? (
            <div className="flex flex-wrap items-center gap-2">
              {next ? (
                <button type="button" className="btn-ink btn-sm" onClick={() => moveTo(next)} disabled={busy === "stage"} aria-busy={busy === "stage"}>
                  Move to {t.stages[next]} <ArrowRight size={16} weight="bold" className={dir === "rtl" ? "rotate-180" : ""} />
                </button>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[14px] font-semibold"><CheckCircle size={18} weight="fill" aria-hidden /> Completed</span>
              )}
              <label className="ms-auto flex items-center gap-2 text-[13px] text-stone">
                Jump to
                <select className="field w-auto py-1.5 text-[13.5px]" value={c.stage} onChange={(e) => moveTo(e.target.value as CampaignStage)} disabled={busy === "stage"}>
                  {STAGES.map((st) => (
                    <option key={st} value={st}>{t.stages[st]}</option>
                  ))}
                </select>
              </label>
            </div>
          ) : (
            <RoleNotice cap="campaign.stage" />
          )}
          <p className="text-[12.5px] text-stone">Stages also move on their own: an accepted invitation starts Active, an upload opens Content review, an approval opens Publishing, and released points close it.</p>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* brief */}
        <section className="flex flex-col gap-5 lg:col-span-7" aria-labelledby="brief-title">
          <SectionTitle id="brief-title" title="Brief" />
          <div className="card flex flex-col gap-5 p-5">
            <KV label="Objective"><p className="text-[15.5px] leading-relaxed">{c.objective}</p></KV>
            <div className="grid gap-5 sm:grid-cols-2">
              <KV label="Must have">
                <ul className="flex flex-col gap-1.5">
                  {c.mustHave.map((m) => (
                    <li key={m} className="flex items-start gap-2"><CheckCircle size={18} weight="fill" className="mt-0.5 shrink-0" aria-hidden />{m}</li>
                  ))}
                </ul>
              </KV>
              <KV label="Avoid">
                {c.avoid.length === 0 ? <span className="text-stone">Nothing listed.</span> : (
                  <ul className="flex flex-col gap-1.5">
                    {c.avoid.map((m) => (
                      <li key={m} className="flex items-start gap-2"><XCircle size={18} weight="fill" className="mt-0.5 shrink-0" aria-hidden />{m}</li>
                    ))}
                  </ul>
                )}
              </KV>
              <KV label="Tone">{c.tone}</KV>
              <KV label="Deliverable">{c.deliverable}</KV>
              <KV label="Products">
                <ul className="flex flex-col gap-1">
                  {products.map((p) => (
                    <li key={p!.id}>{p!.name} <span className="text-stone">({p!.type})</span></li>
                  ))}
                </ul>
              </KV>
              <KV label="Points on publish"><span className="inline-flex items-center gap-1 font-display text-[20px] font-bold tabular"><Coins size={18} weight="fill" aria-hidden />{fmtPoints(c.points)}</span></KV>
            </div>
          </div>

          {/* deadline */}
          <div className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <KV label={t.common.deadline}>
                <span className="font-semibold">{fmtDateLong(deadline, lang)}</span>{" "}
                <span className={cx("text-stone", days < 0 && c.stage !== "completed" && "font-semibold text-ink")}>{c.stage === "completed" ? "" : days < 0 ? `(${Math.abs(days)} days over)` : `(${days} days left)`}</span>
                {c.extendedDeadline && <div className="mt-1 text-[13px] text-stone">Originally {fmtDateLong(c.deadline, lang)}.</div>}
              </KV>
              {allowed("campaign.edit") && c.stage !== "completed" && (
                <button type="button" className="btn-paper btn-sm" onClick={() => setExtending((v) => !v)} aria-expanded={extending}>
                  <CalendarPlus size={16} weight="bold" /> Extend
                </button>
              )}
            </div>
            {extending && (
              <form
                className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end"
                onSubmit={(e) => {
                  e.preventDefault();
                  extend();
                }}
              >
                <div className="flex-1">
                  <label className="label" htmlFor="new-deadline">New deadline</label>
                  <input id="new-deadline" type="date" className={cx("field", deadlineError && "field-error")} value={newDeadline} min={toDateInput(deadline)} onChange={(e) => setNewDeadline(e.target.value)} />
                  {deadlineError ? <p className="error-text" role="alert">{deadlineError}</p> : <p className="help">Accepted creators are told in-app.</p>}
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn-ink btn-sm" disabled={busy === "extend"} aria-busy={busy === "extend"}>{busy === "extend" ? "Saving" : "Extend deadline"}</button>
                  <button type="button" className="btn-ghost btn-sm" onClick={() => setExtending(false)}>{t.common.cancel}</button>
                </div>
              </form>
            )}
            {!allowed("campaign.edit") && <RoleNotice cap="campaign.edit" className="mt-3" />}
          </div>
        </section>

        {/* invitations */}
        <section className="lg:col-span-5" aria-labelledby="inv-title">
          <SectionTitle
            id="inv-title"
            title="Invitations"
            count={c.invitations.length}
            aside={
              allowed("creator.invite") && (
                <button type="button" className="btn-grass btn-sm" onClick={() => setInviteOpen(true)}>
                  <UserPlus size={16} weight="bold" /> Invite from shortlist
                </button>
              )
            }
          />
          <p className="mb-3 text-[13px] text-stone">
            <span className="font-semibold text-ink tabular">{inv.accepted}</span> {t.common.accepted.toLowerCase()}, <span className="font-semibold text-ink tabular">{inv.pending}</span> {t.common.pending.toLowerCase()}, <span className="font-semibold text-ink tabular">{inv.declined}</span> {t.common.declined.toLowerCase()}
          </p>
          <RoleNotice cap="creator.invite" className="mb-3" />
          {c.invitations.length === 0 ? (
            <EmptyState title="No one invited yet" body="Open the shortlist to see who fits this brief." />
          ) : (
            <Stagger as="ul" className="flex flex-col gap-2">
              {c.invitations.map((i) => {
                const cr = creatorOf(s, i.creatorId);
                const Icon = INV_ICON[i.status];
                if (!cr) return null;
                return (
                  <StaggerItem key={i.creatorId} as="li">
                    <div className="card flex items-center gap-3 px-4 py-3">
                      <Portrait c={cr} size={40} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 font-semibold leading-tight">{cr.name} <VerificationMark v={cr.verification} /></div>
                        <div className="text-[12.5px] text-stone">
                          Sent {fmtDate(i.sentAt, lang)}{i.respondedAt ? `, replied ${fmtDate(i.respondedAt, lang)}` : ""}
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold">
                        <Icon size={16} weight="fill" aria-hidden />
                        {i.status === "accepted" ? t.common.accepted : i.status === "declined" ? t.common.declined : t.common.pending}
                      </span>
                    </div>
                  </StaggerItem>
                );
              })}
            </Stagger>
          )}
        </section>
      </div>

      {/* submissions and publications */}
      <div className="grid gap-8 lg:grid-cols-12">
        <section className="lg:col-span-7" aria-labelledby="subs-title">
          <SectionTitle id="subs-title" title="Cuts" count={subs.length} aside={subs.length > 0 && <Link href={`/admin/review?campaign=${c.id}`} className="btn-paper btn-sm">Open in review queue</Link>} />
          {subs.length === 0 ? (
            <EmptyState title="No cuts uploaded" body="Accepted creators upload from their campaign page. Each upload lands in the review queue." />
          ) : (
            <ul className="card divide-y divide-line">
              {subs.map((x) => {
                const cr = creatorOf(s, x.creatorId);
                return (
                  <li key={x.id}>
                    <Link href={`/admin/review?campaign=${c.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-paper-2">
                      {cr && <Portrait c={cr} size={36} />}
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold leading-tight">{cr?.name} <span className="font-normal text-stone">v{x.version}</span></div>
                        <div className="truncate text-[12.5px] text-stone">{x.fileName}, {fmtDate(x.uploadedAt, lang)}</div>
                      </div>
                      <StatusMark status={x.status} />
                      <span className="font-display text-[18px] font-bold tabular">{x.score}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
        <section className="lg:col-span-5" aria-labelledby="pubs-title">
          <SectionTitle id="pubs-title" title="Live posts" count={pubs.length} />
          {pubs.length === 0 ? (
            <EmptyState title="Nothing published yet" body="Approved creators paste the live link from their side." />
          ) : (
            <ul className="flex flex-col gap-2">
              {pubs.map((p) => {
                const cr = creatorOf(s, p.creatorId);
                return (
                  <li key={p.id} className="card px-4 py-3">
                    <div className="flex items-center gap-3">
                      {cr && <Portrait c={cr} size={36} />}
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold leading-tight">{cr?.name}</div>
                        <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[12.5px] text-stone underline underline-offset-4 hover:text-ink">
                          {PLATFORM_LABELS[p.platform]}, {fmtDate(p.postedAt, lang)} <ArrowSquareOut size={12} weight="bold" aria-hidden />
                        </a>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold">
                        {p.verification === "verified" ? <CheckCircle size={16} weight="fill" aria-hidden /> : <Hourglass size={16} weight="fill" aria-hidden />}
                        {p.verification === "verified" ? (p.pointsReleased ? "Points released" : "Verified") : "Awaiting verification"}
                      </span>
                    </div>
                    <div className="mt-2 flex gap-3 text-[12.5px] text-stone">
                      <span><span className="font-semibold text-ink tabular">{fmtFollowers(p.engagement.views)}</span> views</span>
                      <span><span className="font-semibold text-ink tabular">{fmtFollowers(p.engagement.likes)}</span> likes</span>
                      <span><span className="font-semibold text-ink tabular">{p.engagement.comments}</span> comments</span>
                      <SimTag>{t.common.simulated}</SimTag>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <CampaignForm open={edit} onClose={() => setEdit(false)} campaign={c} />

      <Drawer open={inviteOpen} onClose={() => setInviteOpen(false)} title={<span className="flex items-center gap-2">Invite to {c.title}</span>} width={480}>
        <p className="mb-3 text-[13.5px] text-stone">Shortlisted creators first, then by match score. Match is a simulated blend of market, niche, reach and verification.</p>
        {!allowed("creator.invite") && <RoleNotice cap="creator.invite" className="mb-3" />}
        {candidates.length === 0 ? (
          <Notice>Everyone in the Squad is already invited.</Notice>
        ) : (
          <ul className="flex flex-col gap-2">
            {candidates.map(({ cr, match }) => (
              <li key={cr.id} className="card flex items-center gap-3 px-3 py-2.5">
                <Portrait c={cr} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-1.5 font-semibold leading-tight">
                    {cr.name}
                    {cr.shortlisted && <Star size={14} weight="fill" aria-label="Shortlisted" />}
                  </div>
                  <div className="truncate text-[12px] text-stone">{cr.market}, {cr.niches.slice(0, 2).join(", ")}, {fmtFollowers(maxFollowers(cr))}</div>
                </div>
                <div className="flex flex-col items-center rounded-input bg-paper-2 px-2 py-1" title="Match score, simulated">
                  <span className="font-display text-[16px] font-bold leading-none tabular">{match}</span>
                  <span className="text-[9.5px] font-semibold uppercase tracking-wide text-stone">match</span>
                </div>
                <button type="button" className="btn-ink btn-sm" onClick={() => invite(cr.id)} disabled={!allowed("creator.invite") || busy === `inv-${cr.id}`} aria-busy={busy === `inv-${cr.id}`}>
                  <PaperPlaneTilt size={14} weight="bold" /> Invite
                </button>
              </li>
            ))}
          </ul>
        )}
      </Drawer>

      <Sheet
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this draft?"
        footer={
          <>
            <button type="button" className="btn-ghost" onClick={() => setConfirmDelete(false)}>{t.common.cancel}</button>
            <button type="button" className="btn-coral" onClick={remove} disabled={busy === "delete"} aria-busy={busy === "delete"}>
              <Trash size={16} weight="bold" /> {busy === "delete" ? "Deleting" : "Delete draft"}
            </button>
          </>
        }
      >
        <p className="text-[14.5px] text-stone">{c.title} goes away for good. Only drafts can be deleted, so nothing sent to a creator is affected.</p>
      </Sheet>
    </div>
  );
}
