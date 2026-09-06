"use client";
import { useState } from "react";
import Link from "next/link";
import { CheckCircle, ChatCircle, Hourglass, PaperPlaneTilt, Play, Warning, XCircle, type Icon } from "@phosphor-icons/react";
import type { AppState, Submission, SubmissionStatus } from "@/lib/store/types";
import { addComment, reviewSubmission, simulate } from "@/lib/store/actions";
import { CRITERIA } from "@/lib/store/scoring";
import { useLang } from "@/lib/i18n/provider";
import { cx, fmtBytes, fmtDateTime, timeAgo } from "@/lib/format";
import { ACCENT } from "@/components/ui/accent";
import { ScoreRing, SimTag, Tag } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { PaperBurst } from "@/components/motion";
import { ExpandRow, Collapse } from "./expand-row";
import { RoleNotice, useActor } from "./role-gate";
import { Portrait } from "./creator-row";
import { brandOf, campaignOf, creatorOf, SUBMISSION_STATUS_LABEL } from "./helpers";

const STATUS_ICON: Record<SubmissionStatus, Icon> = { analysing: Hourglass, in_review: Hourglass, changes_requested: Warning, approved: CheckCircle };

export function StatusMark({ status }: { status: SubmissionStatus }) {
  const Icon = STATUS_ICON[status];
  return (
    <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-ink">
      <Icon size={16} weight="fill" aria-hidden />
      {SUBMISSION_STATUS_LABEL[status]}
    </span>
  );
}

export function ReviewRow({ s, sub, open, onToggle }: { s: AppState; sub: Submission; open: boolean; onToggle: () => void }) {
  const { t, lang } = useLang();
  const { actor, allowed } = useActor();
  const { toast } = useToast();
  const creator = creatorOf(s, sub.creatorId);
  const campaign = campaignOf(s, sub.campaignId);
  const brand = campaign ? brandOf(s, campaign.brandId) : undefined;
  const accent = brand?.accent ?? "grass";
  const criteria = campaign?.criteria.length ? campaign.criteria : CRITERIA;

  const [reply, setReply] = useState("");
  const [askingChanges, setAskingChanges] = useState(false);
  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState("");
  const [busy, setBusy] = useState<"reply" | "changes" | "approve" | null>(null);
  const [burst, setBurst] = useState(0);

  async function sendReply() {
    if (!reply.trim()) return;
    setBusy("reply");
    await simulate(() => addComment(sub.id, actor, "reviewer", reply.trim()), 300);
    setReply("");
    setBusy(null);
    toast("Note sent", `${creator?.name.split(" ")[0]} gets a simulated in-app notification.`, "info");
  }
  async function requestChanges() {
    if (note.trim().length < 8) {
      setNoteError("Tell the creator what to change. A sentence is enough.");
      return;
    }
    setNoteError("");
    setBusy("changes");
    await simulate(() => reviewSubmission(sub.id, actor, "changes_requested", note.trim()));
    setBusy(null);
    setAskingChanges(false);
    setNote("");
    toast("Changes requested", `${creator?.name} gets a simulated email with your note.`, "info");
  }
  async function approve() {
    setBusy("approve");
    await simulate(() => reviewSubmission(sub.id, actor, "approved"));
    setBusy(null);
    setBurst((n) => n + 1);
    toast("Approved", `${campaign?.title} moves to Publishing. ${campaign?.points ?? 0} points sit as pending until the post is verified.`);
  }

  return (
    <ExpandRow
      open={open}
      onToggle={onToggle}
      accentHex={ACCENT[accent].hex}
      summary={
        <div className="flex items-center gap-3">
          {creator && <Portrait c={creator} size={40} />}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="font-display text-[16px] font-bold leading-tight">{creator?.name}</span>
              <Tag outline>v{sub.version}</Tag>
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[13px] text-stone">
              <span className="font-semibold text-ink">{campaign?.title}</span>
              <span>{brand?.name}</span>
              <span>{timeAgo(sub.uploadedAt)}</span>
            </div>
          </div>
          <div className="hidden sm:block"><StatusMark status={sub.status} /></div>
          <div className="flex shrink-0 flex-col items-center rounded-input bg-paper-2 px-2.5 py-1.5" title="Weighted simulated score">
            <span className="font-display text-[18px] font-bold leading-none tabular">{sub.score}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-stone">score</span>
          </div>
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* placeholder player */}
        <div>
          <div className="relative mx-auto aspect-[9/16] w-full max-w-[220px] overflow-hidden rounded-[22px] border border-line-strong bg-paper-2" role="img" aria-label={`Placeholder player for ${sub.fileName}`}>
            <span className="absolute inset-x-6 top-8 h-2/5 rounded-[40%_60%_50%_50%/50%_50%_50%_50%]" style={{ background: ACCENT[accent].softHex }} aria-hidden />
            <span className="absolute -bottom-6 -start-6 h-1/3 w-3/4 rounded-[50%] bg-grass-soft" aria-hidden />
            <span className="absolute inset-0 flex items-center justify-center" aria-hidden>
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-line-strong bg-card">
                <Play size={28} weight="fill" className="ms-1 text-ink" />
              </span>
            </span>
            <span className="absolute inset-x-3 bottom-3 rounded-input bg-card/90 px-2.5 py-1.5 text-[11.5px] leading-tight">
              <span className="block truncate font-semibold" title={sub.fileName}>{sub.fileName}</span>
              <span className="text-stone">{fmtBytes(sub.fileSize)}, {fmtDateTime(sub.uploadedAt, lang)}</span>
            </span>
          </div>
          <div className="mt-2 text-center"><SimTag>Placeholder player, simulated</SimTag></div>
          <div className="mt-3 sm:hidden"><StatusMark status={sub.status} /></div>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          {/* scores */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex shrink-0 flex-col items-center gap-1">
              <ScoreRing score={sub.score} accent={accent} size={92} label="Weighted score" />
              <span className="text-[11.5px] font-semibold text-stone">Weighted score</span>
              <SimTag>Simulated analysis</SimTag>
            </div>
            <ul className="flex flex-1 flex-col gap-2.5">
              {criteria.map((cr) => {
                const b = sub.breakdown.find((x) => x.criterionId === cr.id);
                const score = b?.score ?? 0;
                return (
                  <li key={cr.id}>
                    <div className="flex items-baseline justify-between gap-2 text-[13.5px]">
                      <span className="font-semibold">{cr.label} <span className="font-normal text-stone">({cr.weight}%)</span></span>
                      <span className="font-display text-[15px] font-bold tabular">{score}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-pill bg-paper-3" aria-hidden>
                      <div className="h-full rounded-pill transition-[width] duration-700" style={{ width: open ? `${score}%` : 0, background: ACCENT[accent].hex, transitionTimingFunction: "var(--ease-out-soft)" }} />
                    </div>
                    {b?.note && <p className="mt-1 text-[12.5px] text-stone">{b.note}</p>}
                  </li>
                );
              })}
            </ul>
          </div>

          {sub.script && (
            <div className="rounded-card border border-line bg-paper-2 p-4">
              <div className="mb-1 text-[12px] font-bold uppercase tracking-[0.12em] text-stone">Creator&rsquo;s script</div>
              <p className="whitespace-pre-line text-[14px] leading-relaxed">{sub.script}</p>
            </div>
          )}

          {/* thread */}
          <div>
            <div className="mb-2 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.12em] text-stone">
              <ChatCircle size={16} weight="bold" aria-hidden /> Notes ({sub.comments.length})
            </div>
            {sub.comments.length === 0 ? (
              <p className="text-[13.5px] text-stone">No notes yet. The first one sets the tone.</p>
            ) : (
              <ol className="flex flex-col gap-2">
                {sub.comments.map((cm) => (
                  <li key={cm.id} className={cx("max-w-[60ch] rounded-card border px-4 py-3", cm.role === "reviewer" ? "ms-0 border-line-strong bg-card" : "ms-6 border-line bg-paper-2")}>
                    <div className="flex flex-wrap items-center gap-x-2 text-[12px] text-stone">
                      <span className="font-semibold text-ink">{cm.author}</span>
                      <Tag outline>{cm.role === "reviewer" ? "Reviewer" : "Creator"}</Tag>
                      <span className="ms-auto">{fmtDateTime(cm.at, lang)}</span>
                    </div>
                    <p className="mt-1 text-[14px] leading-relaxed">{cm.text}</p>
                  </li>
                ))}
              </ol>
            )}
            <form
              className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end"
              onSubmit={(e) => {
                e.preventDefault();
                sendReply();
              }}
            >
              <label className="flex-1">
                <span className="label">Reply as {actor}</span>
                <textarea className="field" rows={2} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Timestamp what you mean, for example 0:07 hold the pack." />
              </label>
              <button type="submit" className="btn-paper btn-sm" disabled={!reply.trim() || busy === "reply"} aria-busy={busy === "reply"}>
                <PaperPlaneTilt size={16} weight="bold" /> {busy === "reply" ? "Sending" : "Send note"}
              </button>
            </form>
          </div>

          {/* decision */}
          <div className="relative rounded-card border border-line bg-card p-4">
            <PaperBurst trigger={burst} />
            {sub.status === "approved" ? (
              <div className="flex flex-wrap items-center gap-2 text-[14px]">
                <CheckCircle size={20} weight="fill" className="text-ink" aria-hidden />
                <span className="font-semibold">Approved{sub.reviewedBy ? ` by ${sub.reviewedBy}` : ""}.</span>
                <span className="text-stone">The creator publishes next, then Loyalty verifies the live post.</span>
                <Link href="/admin/loyalty" className="ms-auto text-[13.5px] font-semibold underline underline-offset-4">Open Loyalty</Link>
              </div>
            ) : allowed("review.decide") ? (
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  <button type="button" className={cx("btn-paper btn-sm", askingChanges && "bg-paper-2")} onClick={() => setAskingChanges((v) => !v)} aria-expanded={askingChanges}>
                    <XCircle size={16} weight="bold" /> Request changes
                  </button>
                  <button type="button" className="btn-grass btn-sm" onClick={approve} disabled={busy !== null} aria-busy={busy === "approve"}>
                    <CheckCircle size={16} weight="bold" /> {busy === "approve" ? "Approving" : "Approve"}
                  </button>
                  {sub.status === "changes_requested" && <span className="self-center text-[13px] text-stone">Changes were requested{sub.reviewedBy ? ` by ${sub.reviewedBy}` : ""}. Waiting for a new cut.</span>}
                </div>
                <Collapse open={askingChanges}>
                  <div className="pt-1">
                    <label className="label" htmlFor={`${sub.id}-note`}>What should change? <span className="text-stone">({t.common.required})</span></label>
                    <textarea id={`${sub.id}-note`} className={cx("field", noteError && "field-error")} rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="The pack is out of focus at 0:07, can you hold it a beat longer?" />
                    {noteError && <p className="error-text" role="alert">{noteError}</p>}
                    <div className="mt-2 flex gap-2">
                      <button type="button" className="btn-ink btn-sm" onClick={requestChanges} disabled={busy !== null} aria-busy={busy === "changes"}>
                        {busy === "changes" ? "Sending" : "Send and request changes"}
                      </button>
                      <button type="button" className="btn-ghost btn-sm" onClick={() => setAskingChanges(false)}>{t.common.cancel}</button>
                    </div>
                  </div>
                </Collapse>
              </div>
            ) : (
              <RoleNotice cap="review.decide" />
            )}
          </div>
        </div>
      </div>
    </ExpandRow>
  );
}
