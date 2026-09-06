"use client";
import { useEffect, useId, useState } from "react";
import { Drawer, useToast } from "@/components/ui/overlays";
import { Field } from "@/components/ui/primitives";
import { useAppState } from "@/lib/store/hooks";
import { createCampaign, updateCampaign, simulate, MARKETS, type CampaignInput } from "@/lib/store/actions";
import type { Campaign, Market } from "@/lib/store/types";
import { useLang } from "@/lib/i18n/provider";
import { cx } from "@/lib/format";
import { useActor } from "./role-gate";
import { fromDateInput, toDateInput } from "./helpers";

type Draft = {
  title: string;
  brandId: string;
  productIds: string[];
  markets: Market[];
  objective: string;
  mustHave: string;
  avoid: string;
  tone: string;
  deliverable: string;
  deadline: string;
  points: string;
};
type Errors = Partial<Record<keyof Draft, string>>;

const lines = (v: string) => v.split("\n").map((x) => x.trim()).filter(Boolean);

function fromCampaign(c?: Campaign): Draft {
  return {
    title: c?.title ?? "",
    brandId: c?.brandId ?? "",
    productIds: c?.productIds ?? [],
    markets: c?.markets ?? ["UAE"],
    objective: c?.objective ?? "",
    mustHave: c?.mustHave.join("\n") ?? "",
    avoid: c?.avoid.join("\n") ?? "",
    tone: c?.tone ?? "",
    deliverable: c?.deliverable ?? "",
    deadline: c ? toDateInput(c.extendedDeadline ?? c.deadline) : "",
    points: c ? String(c.points) : "",
  };
}

/** Drawer form for a new campaign or edits to an existing one. Validates before it touches the store. */
export function CampaignForm({ open, onClose, campaign, onSaved }: { open: boolean; onClose: () => void; campaign?: Campaign; onSaved?: (id: string) => void }) {
  const s = useAppState();
  const { t } = useLang();
  const { actor } = useActor();
  const { toast } = useToast();
  const uid = useId();
  const [d, setD] = useState<Draft>(() => fromCampaign(campaign));
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setD(fromCampaign(campaign));
      setErrors({});
    }
  }, [open, campaign]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));
  const products = s.products.filter((p) => p.brandId === d.brandId);

  function validate(): Errors {
    const e: Errors = {};
    if (d.title.trim().length < 4) e.title = "Give the campaign a title of at least 4 characters.";
    if (!d.brandId) e.brandId = "Pick the brand this brief belongs to.";
    if (!d.productIds.length) e.productIds = "Choose at least one product from the library.";
    if (!d.markets.length) e.markets = "Choose at least one market.";
    if (d.objective.trim().length < 12) e.objective = "Write one clear sentence about what the video should do.";
    if (!lines(d.mustHave).length) e.mustHave = "List at least one thing that must be in the video.";
    if (!d.tone.trim()) e.tone = "Describe the tone in a few words.";
    if (!d.deliverable.trim()) e.deliverable = "Say what the creator should deliver.";
    if (!d.deadline) e.deadline = "Set a deadline.";
    else if (new Date(`${d.deadline}T12:00:00`).getTime() < Date.now() - 86_400_000 && !campaign) e.deadline = "The deadline is already in the past.";
    const pts = Number(d.points);
    if (!d.points || !Number.isInteger(pts) || pts < 50) e.points = "Points must be a whole number of at least 50.";
    return e;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    const input: CampaignInput = {
      title: d.title.trim(), brandId: d.brandId, productIds: d.productIds, markets: d.markets,
      objective: d.objective.trim(), mustHave: lines(d.mustHave), avoid: lines(d.avoid), tone: d.tone.trim(), deliverable: d.deliverable.trim(),
      deadline: fromDateInput(d.deadline), points: Number(d.points),
    };
    const id = await simulate(() => {
      if (campaign) {
        const { deadline, ...rest } = input;
        updateCampaign(campaign.id, campaign.extendedDeadline ? { ...rest, extendedDeadline: deadline } : { ...rest, deadline }, actor);
        return campaign.id;
      }
      return createCampaign(input, actor);
    });
    setBusy(false);
    toast(campaign ? "Campaign updated" : "Draft created", campaign ? `${input.title} saved.` : `${input.title} is a draft. Invite creators when the brief is ready.`);
    onSaved?.(id);
    onClose();
  }

  const formId = `${uid}-form`;
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={campaign ? `Edit ${campaign.title}` : "New campaign"}
      width={520}
      footer={
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-ghost" onClick={onClose} disabled={busy}>{t.common.cancel}</button>
          <button type="submit" form={formId} className="btn-grass" disabled={busy} aria-busy={busy}>
            {busy ? "Saving" : campaign ? t.common.save : "Create draft"}
          </button>
        </div>
      }
    >
      <form id={formId} onSubmit={submit} noValidate className="flex flex-col gap-4">
        <Field label="Title" error={errors.title} htmlFor={`${uid}-title`}>
          <input id={`${uid}-title`} className={cx("field", errors.title && "field-error")} value={d.title} onChange={(e) => set("title", e.target.value)} placeholder="Amla Strong Roots Challenge" />
        </Field>

        <Field label="Brand" error={errors.brandId} htmlFor={`${uid}-brand`}>
          <select id={`${uid}-brand`} className={cx("field", errors.brandId && "field-error")} value={d.brandId} onChange={(e) => { set("brandId", e.target.value); set("productIds", []); }}>
            <option value="">Choose a brand</option>
            {s.brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}, {b.category}</option>
            ))}
          </select>
        </Field>

        <fieldset>
          <legend className="label">Products</legend>
          {!d.brandId ? (
            <p className="help">Pick a brand to see its products.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {products.map((p) => {
                const on = d.productIds.includes(p.id);
                return (
                  <label key={p.id} className={cx("flex cursor-pointer items-center gap-3 rounded-input border-2 px-3 py-2 text-[14px] transition-colors", on ? "border-ink bg-card" : "border-line bg-card hover:bg-paper-2")}>
                    <input type="checkbox" className="h-4 w-4 accent-[var(--color-grass)]" checked={on} onChange={(e) => set("productIds", e.target.checked ? [...d.productIds, p.id] : d.productIds.filter((x) => x !== p.id))} />
                    <span className="flex-1">{p.name}</span>
                    <span className="text-[12px] text-stone">{p.type}</span>
                  </label>
                );
              })}
            </div>
          )}
          {errors.productIds && <p className="error-text" role="alert">{errors.productIds}</p>}
        </fieldset>

        <fieldset>
          <legend className="label">Markets</legend>
          <div className="flex gap-2">
            {MARKETS.map((m) => {
              const on = d.markets.includes(m);
              return (
                <label key={m} className={cx("flex cursor-pointer items-center gap-2 rounded-pill border-2 px-4 py-2 text-[14px] font-semibold transition-colors", on ? "border-ink bg-ink text-card" : "border-line bg-card hover:bg-paper-2")}>
                  <input type="checkbox" className="sr-only" checked={on} onChange={(e) => set("markets", e.target.checked ? [...d.markets, m] : d.markets.filter((x) => x !== m))} />
                  {m}
                </label>
              );
            })}
          </div>
          {errors.markets && <p className="error-text" role="alert">{errors.markets}</p>}
        </fieldset>

        <Field label="Objective" error={errors.objective} htmlFor={`${uid}-objective`} help="One sentence. What should the video make people feel or do?">
          <textarea id={`${uid}-objective`} rows={2} className={cx("field", errors.objective && "field-error")} value={d.objective} onChange={(e) => set("objective", e.target.value)} />
        </Field>

        <Field label="Must have" error={errors.mustHave} htmlFor={`${uid}-must`} help="One per line.">
          <textarea id={`${uid}-must`} rows={3} className={cx("field", errors.mustHave && "field-error")} value={d.mustHave} onChange={(e) => set("mustHave", e.target.value)} placeholder={"Pack visible in the first 5 seconds\nSay the brand name once"} />
        </Field>

        <Field label="Avoid" htmlFor={`${uid}-avoid`} help="One per line. Claims the legal team would not sign off go here.">
          <textarea id={`${uid}-avoid`} rows={2} className="field" value={d.avoid} onChange={(e) => set("avoid", e.target.value)} placeholder={"Medical claims\nComparing to other brands"} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tone" error={errors.tone} htmlFor={`${uid}-tone`}>
            <input id={`${uid}-tone`} className={cx("field", errors.tone && "field-error")} value={d.tone} onChange={(e) => set("tone", e.target.value)} placeholder="Warm, unhurried, personal" />
          </Field>
          <Field label="Deliverable" error={errors.deliverable} htmlFor={`${uid}-deliverable`}>
            <input id={`${uid}-deliverable`} className={cx("field", errors.deliverable && "field-error")} value={d.deliverable} onChange={(e) => set("deliverable", e.target.value)} placeholder="One 30 to 60 second vertical video" />
          </Field>
          <Field label={campaign?.extendedDeadline ? "Extended deadline" : t.common.deadline} error={errors.deadline} htmlFor={`${uid}-deadline`}>
            <input id={`${uid}-deadline`} type="date" className={cx("field", errors.deadline && "field-error")} value={d.deadline} onChange={(e) => set("deadline", e.target.value)} />
          </Field>
          <Field label="Points on publish" error={errors.points} htmlFor={`${uid}-points`}>
            <input id={`${uid}-points`} type="number" min={50} step={50} inputMode="numeric" className={cx("field tabular", errors.points && "field-error")} value={d.points} onChange={(e) => set("points", e.target.value)} placeholder="900" />
          </Field>
        </div>
      </form>
    </Drawer>
  );
}
