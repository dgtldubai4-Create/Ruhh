"use client";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BookOpen, CalendarBlank, Camera, CheckCircle, Coins, HourglassMedium, ListChecks, PaperPlaneTilt, Plus, UsersThree } from "@phosphor-icons/react";
import { PageHeader } from "@/components/shell/portal-shell";
import { Reveal, Stagger, StaggerItem, PaperBurst } from "@/components/motion";
import { Art, PaperScene, Sticker } from "@/components/art/scenes";
import { Pack } from "@/components/art/pack";
import { ACCENT } from "@/components/ui/accent";
import { Notice, SimTag, Tag } from "@/components/ui/primitives";
import { Drawer, useToast } from "@/components/ui/overlays";
import { joinQuest, submitQuest } from "@/lib/store/actions";
import { useLang } from "@/lib/i18n/provider";
import { cx, fmtDate, fmtDateTime, fmtPoints } from "@/lib/format";
import type { Participation, Quest, QuestKind } from "@/lib/store/types";
import { useCreator, brandOf, packLabel, deadlineLabel, PARTICIPATION_LABEL } from "@/components/creator/helpers";

const KIND: Record<QuestKind, { label: string; icon: typeof BookOpen; blurb: string }> = {
  education: { label: "Learn", icon: BookOpen, blurb: "Read a little, answer a question." },
  creative: { label: "Make", icon: Camera, blurb: "Film or shoot something small." },
  community: { label: "Share", icon: UsersThree, blurb: "Say something to the Squad." },
};

export default function CreatorQuests() {
  const { s, creatorId } = useCreator();
  const { t } = useLang();
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<QuestKind | "all">("all");

  const participations = s.participations.filter((p) => p.creatorId === creatorId);
  const byId = (id: string) => participations.find((p) => p.questId === id);
  const done = participations.filter((p) => p.status === "completed").length;
  const questPoints = s.ledger.filter((l) => l.creatorId === creatorId && l.type === "earned" && l.refId?.startsWith("q_") && l.released).reduce((a, l) => a + l.points, 0);
  const quests = s.quests.filter((q) => filter === "all" || q.kind === filter);
  const openQuest = s.quests.find((q) => q.id === openId) ?? null;

  return (
    <div>
      <Reveal y={12} amount={0.05}>
        <div className="mb-8 grid items-center gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <PageHeader title={t.creator.quests} lede="Small, self-paced missions across the brands. No invitation needed, no deadline pressure, points on completion." />
            <div className="flex flex-wrap gap-3 text-[13.5px]">
              <span className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-card px-3 py-1.5">
                <CheckCircle size={16} weight="fill" /> {done} completed
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-card px-3 py-1.5 tabular">
                <Coins size={16} weight="fill" /> {fmtPoints(questPoints)} {t.common.pts} from quests
              </span>
            </div>
          </div>
          <div className="relative lg:col-span-5">
            <div className="card-paper overflow-hidden -rotate-1">
              <Art id="questFilming" alt="Paper-cut scene of a creator filming a pack reveal at home" className="aspect-[16/10] w-full" fallback={<PaperScene accent="sun" />} />
            </div>
            <Sticker accent="coral" rotate={5} className="absolute -bottom-3 start-6">
              +{fmtPoints(s.quests.reduce((a, q) => a + q.points, 0))} {t.common.pts} on the table
            </Sticker>
          </div>
        </div>
      </Reveal>

      <div className="mb-5 flex flex-wrap gap-1.5" role="tablist" aria-label="Quest type">
        {(["all", "education", "creative", "community"] as const).map((k) => (
          <button key={k} role="tab" aria-selected={filter === k} onClick={() => setFilter(k)} className={cx("rounded-pill border-2 px-3.5 py-1.5 text-[13px] font-semibold transition-colors", filter === k ? "border-ink bg-ink text-card" : "border-line bg-card hover:bg-paper-2")}>
            {k === "all" ? t.common.all : KIND[k].label}
          </button>
        ))}
      </div>

      <Stagger className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {quests.map((q) => (
          <StaggerItem key={q.id}>
            <QuestCard quest={q} participation={byId(q.id)} onOpen={() => setOpenId(q.id)} />
          </StaggerItem>
        ))}
      </Stagger>

      <QuestDrawer quest={openQuest} participation={openQuest ? byId(openQuest.id) : undefined} onClose={() => setOpenId(null)} />
    </div>
  );
}

function statusOf(p?: Participation) {
  return p?.status ?? "available";
}

function QuestCard({ quest, participation, onOpen }: { quest: Quest; participation?: Participation; onOpen: () => void }) {
  const { s } = useCreator();
  const { t, lang } = useLang();
  const brand = brandOf(s, quest.brandId);
  const accent = brand?.accent ?? "grass";
  const a = ACCENT[accent];
  const status = statusOf(participation);
  const K = KIND[quest.kind];
  const cta = status === "available" ? "Join" : status === "joined" ? "Continue" : status === "completed" ? "See feedback" : "See submission";
  const StatusIcon = status === "completed" ? CheckCircle : status === "available" ? Plus : status === "joined" ? ListChecks : HourglassMedium;

  return (
    <article className={cx("card-lift flex h-full flex-col overflow-hidden rounded-card border-2 border-ink bg-card", status === "completed" && "opacity-90")} style={{ boxShadow: "5px 5px 0 0 var(--color-ink)" }}>
      <div className="relative h-[130px]" style={{ background: a.softHex }}>
        <span className="absolute -start-6 -bottom-10 h-32 w-32 rounded-full" style={{ background: a.hex, opacity: 0.45 }} aria-hidden />
        <div className="absolute end-6 top-3">
          <Pack shape={brand?.packShape} accent={accent} label={packLabel(brand)} size={64} tilt={6} />
        </div>
        <div className="absolute start-4 top-4 flex flex-col items-start gap-1.5">
          <Tag accent={accent}>
            <K.icon size={13} weight="fill" /> {K.label}
          </Tag>
          <Tag outline>
            <StatusIcon size={13} weight="fill" /> {PARTICIPATION_LABEL[status]}
          </Tag>
        </div>
        <div className="absolute bottom-3 start-4 text-[12px] font-semibold text-ink/80">{brand?.name}</div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="display-sm text-balance">{quest.title}</h3>
          <p className="mt-1 text-[13.5px] leading-relaxed text-stone">{quest.description}</p>
        </div>
        <ol className="flex flex-col gap-1 text-[13px]">
          {quest.steps.map((st, i) => (
            <li key={st} className="flex items-center gap-2">
              <span className={cx("flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold", status === "completed" || (status !== "available" && i === 0) ? "bg-ink text-card" : "bg-paper-2 text-stone")} aria-hidden>
                {status === "completed" ? <CheckCircle size={12} weight="fill" /> : i + 1}
              </span>
              {st}
            </li>
          ))}
        </ol>
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[13px]">
          <span className="inline-flex items-center gap-1.5 font-semibold">
            <Coins size={16} weight="fill" /> {fmtPoints(quest.points)} {t.common.pts}
          </span>
          <span className="inline-flex items-center gap-1.5 text-stone">
            <CalendarBlank size={16} weight="fill" /> {fmtDate(quest.deadline, lang)} <span className="text-stone-soft">({deadlineLabel(quest.deadline)})</span>
          </span>
        </div>
        {participation?.feedback && <p className="rounded-input bg-paper-2 px-3 py-2 text-[13px] text-ink">{participation.feedback}</p>}
        <button className={cx("btn-sm w-full", status === "available" ? "btn-grass" : status === "joined" ? "btn-ink" : "btn-paper")} onClick={onOpen}>
          {cta}
        </button>
      </div>
    </article>
  );
}

function QuestDrawer({ quest, participation, onClose }: { quest: Quest | null; participation?: Participation; onClose: () => void }) {
  const { s, creatorId } = useCreator();
  const { t, lang } = useLang();
  const { toast } = useToast();
  const reduce = useReducedMotion();
  const [answer, setAnswer] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [burst, setBurst] = useState(0);
  const status = statusOf(participation);
  const brand = quest ? brandOf(s, quest.brandId) : undefined;
  const accent = brand?.accent ?? "grass";

  const reset = () => {
    setAnswer(null);
    setText("");
    setFileName("");
    setError(null);
  };
  const close = () => {
    reset();
    onClose();
  };

  const join = () => {
    if (!quest) return;
    joinQuest(quest.id, creatorId);
    toast(`Joined ${quest.title}`, "Take your time. It is here when you are ready.", "info");
  };

  const submit = () => {
    if (!quest) return;
    if (quest.question) {
      if (answer === null) {
        setError("Pick an answer first.");
        return;
      }
    } else if (text.trim().length < 10) {
      setError("Give us a couple of lines, at least ten characters.");
      return;
    }
    setBusy(true);
    window.setTimeout(() => {
      if (quest.question) submitQuest(quest.id, creatorId, quest.question.options[answer as number], undefined, answer as number);
      else submitQuest(quest.id, creatorId, text.trim(), fileName.trim() || undefined);
      setBusy(false);
      setBurst((b) => b + 1);
      if (quest.question) toast(`${fmtPoints(quest.points)} points added`, `${quest.title} is complete.`);
      else toast("Submitted", `A reviewer will look at it and release ${fmtPoints(quest.points)} points.`);
    }, 420);
  };

  const panel = status === "available" ? "join" : status === "joined" ? "form" : status === "completed" ? "done" : "review";

  return (
    <Drawer
      open={Boolean(quest)}
      onClose={close}
      width={480}
      title={
        quest ? (
          <span className="flex flex-wrap items-center gap-2">
            {quest.title} <Tag accent={accent}>{KIND[quest.kind].label}</Tag>
          </span>
        ) : (
          ""
        )
      }
      footer={
        quest && panel === "join" ? (
          <button className="btn-grass w-full" onClick={join}>
            <Plus size={18} weight="bold" /> Join this quest
          </button>
        ) : quest && panel === "form" ? (
          <button className="btn-ink w-full" onClick={submit} disabled={busy} aria-busy={busy}>
            <PaperPlaneTilt size={18} weight="fill" /> {busy ? "Sending" : quest.question ? "Submit answer" : "Submit"}
          </button>
        ) : (
          <button className="btn-paper w-full" onClick={close}>
            {t.common.close}
          </button>
        )
      }
    >
      {quest && (
        <div className="relative">
          <PaperBurst trigger={burst} />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={panel} initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col gap-4">
              <div className="flex items-center gap-3 rounded-card border border-line bg-card p-3">
                <span className="flex h-16 w-12 items-end justify-center overflow-hidden rounded-input" style={{ background: ACCENT[accent].softHex }} aria-hidden>
                  <Pack shape={brand?.packShape} accent={accent} label={packLabel(brand)} size={34} />
                </span>
                <div className="text-[13px]">
                  <div className="font-semibold">{brand?.name}</div>
                  <div className="text-stone">
                    {fmtPoints(quest.points)} {t.common.points} · by {fmtDate(quest.deadline, lang)}
                  </div>
                </div>
              </div>
              <p className="text-[14.5px] leading-relaxed text-ink">{quest.description}</p>

              {panel === "join" && (
                <>
                  <ol className="flex flex-col gap-2">
                    {quest.steps.map((st, i) => (
                      <li key={st} className="flex items-center gap-2.5 text-[14px]">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-paper-2 text-[12px] font-bold">{i + 1}</span> {st}
                      </li>
                    ))}
                  </ol>
                  <p className="text-[13px] text-stone">Joining is free and quiet. Nobody is notified until you submit.</p>
                </>
              )}

              {panel === "form" && quest.question && (
                <fieldset>
                  <legend className="label">{quest.question.prompt}</legend>
                  <div className="flex flex-col gap-2" role="radiogroup">
                    {quest.question.options.map((opt, i) => (
                      <label key={opt} className={cx("flex cursor-pointer items-center gap-3 rounded-input border-2 px-4 py-3 text-[14.5px] transition-colors", answer === i ? "border-ink bg-paper-2" : "border-line bg-card hover:bg-paper-2")}>
                        <input
                          type="radio"
                          name="answer"
                          className="h-4 w-4 accent-[var(--color-grass)]"
                          checked={answer === i}
                          onChange={() => {
                            setAnswer(i);
                            setError(null);
                          }}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                  {error ? <p className="error-text" role="alert">{error}</p> : <p className="help">One try. Points are added either way for finishing the read.</p>}
                </fieldset>
              )}

              {panel === "form" && !quest.question && (
                <div className="flex flex-col gap-4">
                  <div>
                    <label htmlFor="quest-text" className="label">
                      {quest.kind === "community" ? "What you want to share" : "Your idea, in a few lines"}
                    </label>
                    <textarea
                      id="quest-text"
                      className={cx("field min-h-[120px] resize-y", error && "field-error")}
                      rows={4}
                      value={text}
                      onChange={(e) => {
                        setText(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder={quest.kind === "community" ? "Two lines about you and what you film." : "Where you would film it, what the first frame is, what makes it yours."}
                      aria-invalid={Boolean(error)}
                    />
                    {error ? <p className="error-text" role="alert">{error}</p> : <p className="help">A real person reads this, keep it in your own voice.</p>}
                  </div>
                  {quest.kind !== "community" && (
                    <div>
                      <label htmlFor="quest-file" className="label">
                        File name, optional
                      </label>
                      <input id="quest-file" className="field" value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="pack-reveal.mp4" />
                      <p className="help">
                        Just the name for now. <SimTag>Simulated upload</SimTag>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {(panel === "review" || panel === "done") && participation?.submission && (
                <div className="rounded-card border border-line bg-card p-4">
                  <div className="text-[12.5px] font-semibold text-stone">Your submission, {fmtDateTime(participation.submission.at, lang)}</div>
                  <p className="mt-1 text-[14px] text-ink">{participation.submission.text}</p>
                  {participation.submission.fileName && <p className="mt-1 text-[12.5px] text-stone">File: {participation.submission.fileName}</p>}
                </div>
              )}
              {panel === "review" && (
                <Notice kind="info">
                  In review. {fmtPoints(quest.points)} points are pending and release when a reviewer signs it off.
                </Notice>
              )}
              {panel === "done" && (
                <Notice kind="success">
                  <span className="font-semibold">{participation?.feedback ?? "Complete."}</span> {fmtPoints(quest.points)} points are in your available balance.
                </Notice>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </Drawer>
  );
}
