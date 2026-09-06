"use client";
import { use, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, CalendarBlank, ChatCircleDots, CheckCircle, Clock, Coins, FileVideo, FloppyDisk, HourglassMedium, Notebook, Package, UploadSimple, XCircle } from "@phosphor-icons/react";
import { Reveal, PaperBurst } from "@/components/motion";
import { Pack } from "@/components/art/pack";
import { ACCENT } from "@/components/ui/accent";
import { EmptyState, Notice, SimTag, Tag } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { addComment, saveScript, uploadSubmission } from "@/lib/store/actions";
import { CRITERIA } from "@/lib/store/scoring";
import { useLang } from "@/lib/i18n/provider";
import { cx, fmtBytes, fmtDate, fmtDateLong, fmtDateTime, fmtPoints } from "@/lib/format";
import type { Submission } from "@/lib/store/types";
import { useCreator, campaignJourney, brandOf, firstProductOf, packLabel, effectiveDeadline, deadlineLabel, SUBMISSION_LABEL } from "@/components/creator/helpers";
import { StageTracker } from "@/components/creator/stage-tracker";
import { BriefCard } from "@/components/creator/brief-card";
import { UploadZone } from "@/components/creator/upload-zone";
import { ScoreBreakdown } from "@/components/creator/score-breakdown";
import { CommentsThread } from "@/components/creator/comments-thread";
import { PublishForm, PublicationCard } from "@/components/creator/publication-card";
import { ShipmentTracker } from "@/components/creator/shipment-tracker";
import { InvitationSheet, type InvitationDecision } from "@/components/creator/invitation-sheet";

export default function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { s, creator, creatorId } = useCreator();
  const { t, lang, dir } = useLang();
  const { toast } = useToast();
  const reduce = useReducedMotion();

  const campaign = s.campaigns.find((c) => c.id === id);
  const j = campaign ? campaignJourney(s, campaign, creatorId) : null;

  const [request, setRequest] = useState<InvitationDecision | null>(null);
  const [script, setScript] = useState<string | null>(null);
  const [analysing, setAnalysing] = useState(false);
  const [revealId, setRevealId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Reward moments: a burst when the latest cut becomes approved or points release while the page is open.
  const approvedNow = j?.latest?.status === "approved";
  const releasedNow = Boolean(j?.complete);
  const [prevApproved, setPrevApproved] = useState(approvedNow);
  const [prevReleased, setPrevReleased] = useState(releasedNow);
  const [burst, setBurst] = useState(0);
  if (approvedNow !== prevApproved) {
    setPrevApproved(approvedNow);
    if (approvedNow) setBurst((b) => b + 1);
  }
  if (releasedNow !== prevReleased) {
    setPrevReleased(releasedNow);
    if (releasedNow) setBurst((b) => b + 1);
  }

  const Back = (
    <Link href="/creator/campaigns" className="btn-ghost btn-sm -ms-3 mb-4">
      <ArrowLeft size={16} weight="bold" className={dir === "rtl" ? "rotate-180" : ""} /> {t.creator.campaigns}
    </Link>
  );

  if (!campaign || !j) {
    return (
      <div>
        {Back}
        <EmptyState title="We could not find that campaign" body="The link may be old, or the brand team pulled the brief. Your campaigns page has everything that is live for you." action={<Link href="/creator/campaigns" className="btn-ink btn-sm">Back to campaigns</Link>} />
      </div>
    );
  }
  if (!j.invitation) {
    return (
      <div>
        {Back}
        <EmptyState title="This brief was not sent to you" body={`${campaign.title} is running with other creators. Brand teams invite by fit, so keep your profile and niches fresh.`} action={<Link href="/creator/profile" className="btn-paper btn-sm">Update profile</Link>} />
      </div>
    );
  }

  const brand = brandOf(s, campaign.brandId);
  const product = firstProductOf(s, campaign);
  const accent = brand?.accent ?? "grass";
  const a = ACCENT[accent];
  const criteria = campaign.criteria.length ? campaign.criteria : CRITERIA;
  const deadline = effectiveDeadline(campaign);
  const kit = s.shipments.find((sh) => sh.creatorId === creatorId && sh.refId === campaign.id && sh.kind === "product_kit");
  const storedScript = j.latest?.script ?? j.draft?.script ?? "";
  const scriptValue = script ?? storedScript;
  const scriptDirty = scriptValue !== storedScript;
  const selected: Submission | undefined = j.submissions.find((x) => x.id === selectedId) ?? j.latest;
  const canUpload = j.accepted && (!j.latest || j.latest.status === "changes_requested" || j.latest.status === "in_review");

  const onFile = (file: File) => {
    setAnalysing(true);
    window.setTimeout(() => {
      const created = uploadSubmission(campaign.id, creatorId, file.name, file.size);
      setAnalysing(false);
      if (created) {
        setRevealId(created.id);
        setSelectedId(created.id);
        toast(`v${created.version} is in`, `Simulated read: ${created.score} out of 100. A reviewer will take a look.`);
      }
    }, 1400);
  };

  const onSaveScript = () => {
    saveScript(campaign.id, creatorId, scriptValue);
    setScript(null);
    toast(t.common.saved, "Your script is attached to this campaign.");
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        {Back}
        {/* Header */}
        <Reveal y={12} amount={0.05}>
          <div className="relative overflow-hidden rounded-card border-2 border-ink" style={{ background: a.softHex, boxShadow: "6px 6px 0 0 var(--color-ink)" }}>
            <span className="absolute -end-16 -top-16 h-56 w-56 rounded-full" style={{ background: a.hex, opacity: 0.5 }} aria-hidden />
            <div className="relative grid gap-5 p-5 sm:p-7 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[13px] font-bold text-ink/80">{brand?.name}</span>
                  <Tag accent={accent}>{t.stages[campaign.stage]}</Tag>
                  {j.pending && <Tag outline>Invitation {t.common.pending.toLowerCase()}</Tag>}
                  {j.declined && <Tag outline>{t.common.declined}</Tag>}
                  {j.complete && <Tag outline><CheckCircle size={13} weight="fill" /> Done</Tag>}
                </div>
                <h1 className="display-lg mt-2 max-w-[18ch] text-balance">{campaign.title}</h1>
                <p className="mt-2 max-w-[56ch] text-[15px] text-ink/80">{campaign.objective}</p>
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px] font-semibold text-ink">
                  <span className="inline-flex items-center gap-1.5">
                    <Coins size={18} weight="fill" /> {fmtPoints(campaign.points)} {t.common.points}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarBlank size={18} weight="fill" /> {fmtDateLong(deadline, lang)}
                    {campaign.extendedDeadline && <span className="font-normal text-ink/70">(extended)</span>}
                    {!j.complete && !j.declined && <span className="font-normal text-ink/70">{deadlineLabel(deadline)}</span>}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <FileVideo size={18} weight="fill" /> {campaign.deliverable}
                  </span>
                </div>
              </div>
              <div className="flex justify-center md:justify-end" aria-hidden>
                <div className="anim-float" style={{ ["--rot" as string]: "-5deg" }}>
                  <Pack shape={brand?.packShape} accent={accent} label={packLabel(brand)} sub={product?.type.toLowerCase()} size={110} />
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Invitation decision */}
      {j.pending && (
        <Reveal y={12} amount={0.05}>
          <div className="card-paper flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
            <div className="flex-1">
              <div className="display-sm">You are invited. Read the brief, then decide.</div>
              <p className="mt-1 text-[14px] text-stone">
                Sent {fmtDate(j.invitation.sentAt, lang)} by {campaign.ownerName}. Accepting unlocks the upload and queues a product kit. Declining is fine too.
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button className="btn-grass" onClick={() => setRequest({ campaign, decision: "accepted" })}>
                <CheckCircle size={18} weight="fill" /> {t.common.accept}
              </button>
              <button className="btn-paper" onClick={() => setRequest({ campaign, decision: "declined" })}>
                <XCircle size={18} weight="fill" /> {t.common.decline}
              </button>
            </div>
          </div>
        </Reveal>
      )}
      {j.declined && (
        <Notice kind="info">
          You passed on this campaign{j.invitation.respondedAt ? ` on ${fmtDateLong(j.invitation.respondedAt, lang)}` : ""}. The brief stays readable, but uploads are closed. <Link href="/creator/quests" className="font-semibold underline underline-offset-4">Side quests</Link> are always open.
        </Notice>
      )}

      {/* Journey */}
      <Reveal y={12} amount={0.05}>
        <div className="card p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="display-sm">Where this stands</h2>
            <span className="text-[13px] text-stone">{j.complete ? "Every step done" : j.declined ? "Closed" : `Step ${Math.min(j.current + 1, 8)} of 8`}</span>
          </div>
          <StageTracker journey={j} accent={accent} />
        </div>
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-8">
          <Reveal y={12} amount={0.05}>
            <BriefCard campaign={campaign} accent={accent} />
          </Reveal>

          {j.accepted && (
            <>
              {/* Script */}
              <Reveal y={12} amount={0.05}>
                <section className="card p-5 sm:p-6" aria-labelledby="script-title">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-paper-2 text-ink" aria-hidden>
                      <Notebook size={22} weight="fill" />
                    </span>
                    <div className="flex-1">
                      <h2 id="script-title" className="display-sm">Your script, optional</h2>
                      <p className="mt-1 text-[13.5px] text-stone">A few lines on how you will open, what you will say and where the pack shows. Reviewers read it alongside your cut.</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label htmlFor="script" className="label">
                      Script or shot list
                    </label>
                    <textarea
                      id="script"
                      className="field min-h-[120px] resize-y"
                      rows={5}
                      placeholder="Open on the kettle. Cut to the mirror. Say the brand name once, naturally."
                      value={scriptValue}
                      onChange={(e) => setScript(e.target.value)}
                    />
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <button className="btn-ink btn-sm" onClick={onSaveScript} disabled={!scriptDirty}>
                        <FloppyDisk size={16} weight="fill" /> {t.common.save} script
                      </button>
                      {scriptDirty ? <span className="text-[12.5px] text-stone">Unsaved changes</span> : storedScript ? <span className="inline-flex items-center gap-1 text-[12.5px] text-stone"><CheckCircle size={14} weight="fill" /> {t.common.saved}</span> : <span className="text-[12.5px] text-stone">Skip this if you would rather just film.</span>}
                    </div>
                  </div>
                </section>
              </Reveal>

              {/* Upload */}
              <Reveal y={12} amount={0.05}>
                <section className="card p-5 sm:p-6" aria-labelledby="upload-title">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-ink" style={{ background: a.hex }} aria-hidden>
                      <UploadSimple size={22} weight="bold" className="text-ink" />
                    </span>
                    <div className="flex-1">
                      <h2 id="upload-title" className="display-sm">{j.latest ? (canUpload ? `Upload a new cut, v${j.latest.version + 1}` : "Uploads closed") : "Upload your cut"}</h2>
                      <p className="mt-1 text-[13.5px] text-stone">
                        {canUpload
                          ? j.latest?.status === "changes_requested"
                            ? "The reviewer asked for one more pass. Re-cut as many times as you like, every version stays in the history."
                            : j.latest
                              ? "Your latest version is with the reviewer. You can still replace it with a better cut."
                              : "Drop the video in. A simulated read scores five things and explains why, before a real person looks."
                          : "Your cut is approved, so there is nothing more to upload. Publish it below."}
                      </p>
                    </div>
                  </div>
                  <div className="mt-5">
                    {canUpload ? <UploadZone onFile={onFile} analysing={analysing} /> : <Notice kind="success">v{j.latest?.version} approved{j.latest?.reviewedBy ? ` by ${j.latest.reviewedBy}` : ""}. Nice work.</Notice>}
                  </div>

                  <AnimatePresence initial={false}>
                    {revealId && j.latest && j.latest.id === revealId && !analysing && (
                      <motion.div key={revealId} initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }} className="mt-6 rounded-card border-2 border-ink p-5">
                        <ScoreBreakdown submission={j.latest} criteria={criteria} accent={accent} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </section>
              </Reveal>

              {/* Feedback */}
              {selected && (
                <Reveal y={12} amount={0.05}>
                  <section className="relative card p-5 sm:p-6" aria-labelledby="feedback-title">
                    <PaperBurst trigger={approvedNow && !j.publication ? burst : 0} />
                    <div className="flex flex-wrap items-start gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-paper-2 text-ink" aria-hidden>
                        <ChatCircleDots size={22} weight="fill" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h2 id="feedback-title" className="display-sm">
                          Feedback on v{selected.version}
                        </h2>
                        <p className="mt-1 text-[13.5px] text-stone">
                          {selected.fileName} <span className="text-stone-soft">·</span> {fmtBytes(selected.fileSize)} <span className="text-stone-soft">·</span> uploaded {fmtDateTime(selected.uploadedAt, lang)}
                        </p>
                      </div>
                      <Tag outline>
                        {selected.status === "approved" ? <CheckCircle size={13} weight="fill" /> : selected.status === "changes_requested" ? <Clock size={13} weight="fill" /> : <HourglassMedium size={13} weight="fill" />}
                        {SUBMISSION_LABEL[selected.status]}
                      </Tag>
                    </div>

                    {j.submissions.length > 1 && (
                      <div className="mt-4 flex flex-wrap gap-1.5" role="tablist" aria-label="Versions">
                        {j.submissions.map((sub) => (
                          <button key={sub.id} role="tab" aria-selected={sub.id === selected.id} onClick={() => setSelectedId(sub.id)} className={cx("rounded-pill border-2 px-3 py-1 text-[12.5px] font-semibold transition-colors", sub.id === selected.id ? "border-ink bg-ink text-card" : "border-line bg-card hover:bg-paper-2")}>
                            v{sub.version}
                          </button>
                        ))}
                      </div>
                    )}

                    {selected.id !== revealId && (
                      <details className="group mt-4 rounded-input border border-line bg-paper-2/50 px-4 py-3">
                        <summary className="cursor-pointer list-none text-[14px] font-semibold">
                          Simulated read on v{selected.version}: {selected.score} out of 100 <span className="ms-1 text-[12.5px] font-normal text-stone group-open:hidden">show breakdown</span>
                        </summary>
                        <div className="mt-4">
                          <ScoreBreakdown submission={selected} criteria={criteria} accent={accent} />
                        </div>
                      </details>
                    )}

                    <div className="mt-5">
                      <CommentsThread comments={selected.comments} creator={creator} onReply={(text) => { addComment(selected.id, creator.name, "creator", text); toast("Reply sent", "The reviewer sees it in their queue."); }} />
                    </div>
                  </section>
                </Reveal>
              )}

              {/* Publish and publication */}
              {j.latest?.status === "approved" && !j.publication && (
                <Reveal y={12} amount={0.05}>
                  <PublishForm campaign={campaign} creator={creator} />
                </Reveal>
              )}
              {j.publication && (
                <Reveal y={12} amount={0.05}>
                  <PublicationCard publication={j.publication} campaign={campaign} ledger={j.ledger} burst={releasedNow ? burst : 0} />
                </Reveal>
              )}
            </>
          )}
        </div>

        {/* Side column */}
        <aside className="flex flex-col gap-6 lg:col-span-4">
          {/* Points state */}
          <Reveal y={12} amount={0.05}>
            <div className="card p-5">
              <div className="flex items-center gap-2 text-[13px] font-bold">
                <Coins size={18} weight="fill" /> Points for this campaign
              </div>
              <div className="mt-2 font-display text-[32px] font-bold leading-none tabular">{fmtPoints(campaign.points)}</div>
              <p className="mt-2 text-[13px] text-stone">
                {j.ledger?.released
                  ? `Released${j.ledger.releasedAt ? ` on ${fmtDate(j.ledger.releasedAt, lang)}` : ""}. They are in your available balance.`
                  : j.ledger
                    ? "Pending. They release once the live post is verified."
                    : j.declined
                      ? "Not applicable, you passed on this one."
                      : "Earned when a cut is approved, released when the post is verified."}
              </p>
              <Link href="/creator/rewards" className="btn-ghost btn-sm -ms-3 mt-2">
                See balance
              </Link>
            </div>
          </Reveal>

          {/* Product kit */}
          {j.accepted && (
            <Reveal y={12} amount={0.05}>
              {kit ? (
                <ShipmentTracker shipment={kit} />
              ) : (
                <div className="card p-5">
                  <div className="flex items-center gap-2 text-[13px] font-bold">
                    <Package size={18} weight="fill" /> Product kit
                  </div>
                  <p className="mt-2 text-[13px] text-stone">No parcel on record for this campaign. Logistics queues one when you accept.</p>
                </div>
              )}
            </Reveal>
          )}

          {/* Version history */}
          {j.accepted && (
            <Reveal y={12} amount={0.05}>
              <div className="card p-5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[13px] font-bold">
                    <FileVideo size={18} weight="fill" /> Version history
                  </div>
                  <SimTag>Simulated scores</SimTag>
                </div>
                {j.submissions.length === 0 ? (
                  <p className="mt-2 text-[13px] text-stone">Nothing uploaded yet. Your first cut starts the history.</p>
                ) : (
                  <ol className="mt-3 flex flex-col gap-2">
                    {j.submissions.map((sub) => (
                      <li key={sub.id}>
                        <button onClick={() => setSelectedId(sub.id)} className={cx("flex w-full items-center gap-3 rounded-input border px-3 py-2.5 text-start transition-colors", sub.id === selected?.id ? "border-ink bg-paper-2" : "border-line bg-card hover:bg-paper-2")} aria-current={sub.id === selected?.id ? "true" : undefined}>
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-card font-display text-[13px] font-bold" style={{ boxShadow: `inset 0 0 0 2px ${a.hex}` }}>
                            v{sub.version}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[13.5px] font-semibold">{sub.fileName}</span>
                            <span className="block text-[12px] text-stone">
                              {SUBMISSION_LABEL[sub.status]} · {fmtDate(sub.uploadedAt, lang)}
                            </span>
                          </span>
                          <span className="shrink-0 font-display text-[16px] font-bold tabular">{sub.score}</span>
                        </button>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </Reveal>
          )}

          {/* Products in the kit */}
          <Reveal y={12} amount={0.05}>
            <div className="card p-5">
              <div className="text-[13px] font-bold">Products in this brief</div>
              <ul className="mt-3 flex flex-col gap-2">
                {campaign.productIds.map((pid) => {
                  const p = s.products.find((x) => x.id === pid);
                  if (!p) return null;
                  return (
                    <li key={pid} className="flex items-center gap-3">
                      <span className="flex h-12 w-10 items-end justify-center overflow-hidden rounded-[10px]" style={{ background: a.softHex }} aria-hidden>
                        <Pack shape={brand?.packShape} accent={accent} label={packLabel(brand)} size={26} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[13.5px] font-semibold">{p.name}</span>
                        <span className="block text-[12px] text-stone">{p.heroIngredient}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 text-[12px] text-stone">Markets: {campaign.markets.join(", ")}</p>
            </div>
          </Reveal>
        </aside>
      </div>

      <InvitationSheet request={request} creator={creator} onClose={() => setRequest(null)} />
    </div>
  );
}
