"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle, Coins, Compass, FloppyDisk, HourglassMedium, IdentificationCard, Megaphone, ShieldCheck, Warning } from "@phosphor-icons/react";
import { PageHeader } from "@/components/shell/portal-shell";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { ACCENT } from "@/components/ui/accent";
import { Avatar, EmptyState, ScoreRing, SimTag, Tag } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { balances, updateProfile } from "@/lib/store/actions";
import { useLang } from "@/lib/i18n/provider";
import { cx, fmtDate, fmtDateLong, fmtFollowers, fmtPoints } from "@/lib/format";
import type { Creator } from "@/lib/store/types";
import { useCreator, campaignJourney, brandOf, validateAddress, validateEmail, validatePhone, PLATFORM_ICON, PLATFORM_LABEL } from "@/components/creator/helpers";
import { journeyLine } from "@/components/creator/campaign-card";
import { SectionTitle } from "@/components/creator/section";

export default function CreatorProfile() {
  const { s, creator, creatorId } = useCreator();
  const { t, lang } = useLang();
  const bal = balances(s, creatorId);

  const past = useMemo(
    () =>
      s.campaigns
        .filter((c) => c.invitations.some((i) => i.creatorId === creatorId && i.status === "accepted"))
        .map((c) => ({ c, j: campaignJourney(s, c, creatorId) }))
        .sort((a, b) => new Date(b.c.createdAt).getTime() - new Date(a.c.createdAt).getTime()),
    [s, creatorId],
  );
  const mySubs = s.submissions.filter((x) => x.creatorId === creatorId && x.version > 0);
  const avgScore = mySubs.length ? Math.round(mySubs.reduce((a, x) => a + x.score, 0) / mySubs.length) : null;
  const questsDone = s.participations.filter((p) => p.creatorId === creatorId && p.status === "completed").length;
  const campaignsDone = past.filter((x) => x.j.complete).length;
  const totalFollowers = creator.platforms.reduce((a, p) => a + p.followers, 0);

  const verification = {
    verified: { icon: ShieldCheck, title: "Verified", body: "Your identity and advertiser licence details are on file. Briefs in both markets are open to you." },
    pending: { icon: HourglassMedium, title: "Verification pending", body: "The team is checking your details. You can still join quests and read briefs while you wait." },
    unverified: { icon: Warning, title: "Not verified yet", body: "Add your details and a team member will review them. Some campaigns are limited until then." },
  }[creator.verification];

  return (
    <div>
      <PageHeader
        title={t.creator.profile}
        lede="What brand teams see when they shortlist you, and where parcels and emails go."
        aside={
          <div className="flex items-center gap-3">
            <Avatar initials={creator.avatar.initials} tone={creator.avatar.tone} size={52} />
            <div>
              <div className="text-[14.5px] font-semibold">{creator.handle}</div>
              <div className="text-[12.5px] text-stone">Member since {fmtDate(creator.joinedAt, lang)}</div>
            </div>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Reveal y={12} amount={0.05}>
            <ProfileForm key={`${creator.id}-${creator.joinedAt}`} creator={creator} />
          </Reveal>
        </div>

        <aside className="flex flex-col gap-6 lg:col-span-5">
          <Reveal y={12} amount={0.05}>
            <div className="card-paper p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-paper-2 text-ink" aria-hidden>
                  <verification.icon size={24} weight="fill" />
                </span>
                <div>
                  <div className="display-sm">{verification.title}</div>
                  <p className="mt-1 text-[13.5px] text-stone">{verification.body}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 rounded-input border border-line bg-paper-2/60 px-3 py-2.5 text-[13px]">
                <IdentificationCard size={18} weight="fill" className="text-ink" />
                <span className="text-stone">Licence</span>
                <span className="font-semibold tabular">{creator.licenceId}</span>
                <SimTag>Prototype data</SimTag>
              </div>
              <p className="mt-2 text-[12px] text-stone">Market: {creator.market}. Verification changes are made by the brand team, not here.</p>
            </div>
          </Reveal>

          <Reveal y={12} amount={0.05}>
            <div className="card p-5">
              <div className="flex items-center justify-between">
                <div className="text-[13px] font-bold">Platforms</div>
                <span className="text-[12.5px] text-stone">{fmtFollowers(totalFollowers)} across all</span>
              </div>
              <ul className="mt-3 flex flex-col gap-2">
                {creator.platforms.map((p) => {
                  const Icon = PLATFORM_ICON[p.platform];
                  return (
                    <li key={p.platform} className="flex items-center gap-3 rounded-input border border-line px-3 py-2.5">
                      <Icon size={22} weight="fill" className="text-ink" />
                      <span className="flex-1 text-[14px] font-semibold">{PLATFORM_LABEL[p.platform]}</span>
                      <span className="font-display text-[17px] font-bold tabular">{fmtFollowers(p.followers)}</span>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-2 text-[12px] text-stone">Follower counts are synced by the team. <SimTag>Simulated</SimTag></p>
            </div>
          </Reveal>

          <Reveal y={12} amount={0.05}>
            <div className="card p-5">
              <div className="text-[13px] font-bold">Loyalty at a glance</div>
              <dl className="mt-3 grid grid-cols-2 gap-3">
                {[
                  { icon: Coins, label: "Available", value: fmtPoints(bal.available) },
                  { icon: HourglassMedium, label: "Pending", value: fmtPoints(bal.pending) },
                  { icon: Megaphone, label: "Campaigns done", value: String(campaignsDone) },
                  { icon: Compass, label: "Quests done", value: String(questsDone) },
                ].map((st) => (
                  <div key={st.label} className="rounded-input bg-paper-2/60 px-3 py-2.5">
                    <dt className="flex items-center gap-1.5 text-[12px] font-semibold text-stone">
                      <st.icon size={14} weight="fill" className="text-ink" /> {st.label}
                    </dt>
                    <dd className="mt-0.5 font-display text-[22px] font-bold leading-none tabular">{st.value}</dd>
                  </div>
                ))}
              </dl>
              <Link href="/creator/rewards" className="btn-ghost btn-sm -ms-3 mt-2">
                Full history
              </Link>
            </div>
          </Reveal>
        </aside>
      </div>

      {/* Past campaigns */}
      <section className="mt-12" aria-labelledby="past-title">
        <SectionTitle
         
          title={<span id="past-title">Campaigns</span>}
          aside={
            avgScore !== null ? (
              <div className="flex items-center gap-3 rounded-card border border-line bg-card px-4 py-2">
                <ScoreRing score={avgScore} size={56} label="Average simulated score" />
                <div className="text-[12.5px] leading-tight text-stone">
                  Average read across
                  <br />
                  {mySubs.length} cut{mySubs.length === 1 ? "" : "s"} <SimTag>Simulated</SimTag>
                </div>
              </div>
            ) : undefined
          }
        />
        {past.length === 0 ? (
          <EmptyState title="No campaigns yet" body="Accept your first invitation and it shows up here." />
        ) : (
          <Stagger as="ul" className="grid gap-3 md:grid-cols-2">
            {past.map(({ c, j }) => {
              const b = brandOf(s, c.brandId);
              const accent = b?.accent ?? "grass";
              return (
                <StaggerItem key={c.id} as="li">
                  <Link href={`/creator/campaigns/${c.id}`} className="card card-lift flex items-center gap-4 p-4">
                    <span className="h-12 w-3 shrink-0 rounded-pill" style={{ background: ACCENT[accent].hex }} aria-hidden />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-[14.5px] font-semibold">{c.title}</span>
                        <Tag accent={accent}>{t.stages[c.stage]}</Tag>
                      </div>
                      <div className="mt-0.5 text-[12.5px] text-stone">
                        {b?.name} · {fmtDateLong(c.deadline, lang)} · {journeyLine(j)}
                      </div>
                    </div>
                    <div className="shrink-0 text-end">
                      <div className="font-display text-[18px] font-bold tabular">{j.latest ? j.latest.score : "-"}</div>
                      <div className="text-[11px] text-stone">{j.latest ? `v${j.latest.version} read` : "no cut yet"}</div>
                    </div>
                    {j.complete && <CheckCircle size={22} weight="fill" className="shrink-0 text-ink" aria-label="Completed" />}
                  </Link>
                </StaggerItem>
              );
            })}
          </Stagger>
        )}
      </section>
    </div>
  );
}

type FormState = { name: string; bio: string; city: string; languages: string; niches: string; phone: string; email: string; address: string };
type Errors = Partial<Record<keyof FormState, string>>;

function fromCreator(c: Creator): FormState {
  return { name: c.name, bio: c.bio, city: c.city, languages: c.languages.join(", "), niches: c.niches.join(", "), phone: c.phone, email: c.email, address: c.address };
}
const splitList = (v: string) => v.split(",").map((x) => x.trim()).filter(Boolean);

function ProfileForm({ creator }: { creator: Creator }) {
  const { t } = useLang();
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(() => fromCreator(creator));
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(form) !== JSON.stringify(fromCreator(creator));

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const validate = (): Errors => {
    const er: Errors = {};
    if (form.name.trim().length < 2) er.name = "Your name, as brand teams should see it.";
    if (form.bio.trim().length < 10) er.bio = "A line or two helps teams place you. Ten characters minimum.";
    if (!form.city.trim()) er.city = "Which city are you filming from?";
    if (splitList(form.languages).length === 0) er.languages = "At least one language, separated by commas.";
    if (splitList(form.niches).length === 0) er.niches = "At least one niche, separated by commas.";
    const em = validateEmail(form.email);
    if (em) er.email = em;
    const ph = validatePhone(form.phone);
    if (ph) er.phone = ph;
    const ad = validateAddress(form.address);
    if (ad) er.address = ad;
    return er;
  };

  const save = () => {
    const er = validate();
    setErrors(er);
    if (Object.keys(er).length) {
      const first = Object.keys(er)[0];
      document.getElementById(`pf-${first}`)?.focus();
      return;
    }
    setSaving(true);
    window.setTimeout(() => {
      updateProfile(creator.id, {
        name: form.name.trim(), bio: form.bio.trim(), city: form.city.trim(), languages: splitList(form.languages), niches: splitList(form.niches), phone: form.phone.trim(), email: form.email.trim(), address: form.address.trim(),
      });
      setSaving(false);
      toast(t.common.saved, "Brand teams see the update straight away.");
    }, 360);
  };

  const field = (k: keyof FormState, label: string, opts: { help?: string; type?: string; textarea?: boolean; placeholder?: string; autoComplete?: string } = {}) => (
    <div>
      <label htmlFor={`pf-${k}`} className="label">
        {label}
      </label>
      {opts.textarea ? (
        <textarea id={`pf-${k}`} className={cx("field min-h-[88px] resize-y", errors[k] && "field-error")} rows={3} value={form[k]} onChange={set(k)} placeholder={opts.placeholder} aria-invalid={Boolean(errors[k])} aria-describedby={`pf-${k}-msg`} />
      ) : (
        <input id={`pf-${k}`} type={opts.type ?? "text"} className={cx("field", errors[k] && "field-error")} value={form[k]} onChange={set(k)} placeholder={opts.placeholder} autoComplete={opts.autoComplete} aria-invalid={Boolean(errors[k])} aria-describedby={`pf-${k}-msg`} />
      )}
      {errors[k] ? (
        <p id={`pf-${k}-msg`} className="error-text" role="alert">
          {errors[k]}
        </p>
      ) : opts.help ? (
        <p id={`pf-${k}-msg`} className="help">
          {opts.help}
        </p>
      ) : null}
    </div>
  );

  return (
    <form
      className="card flex flex-col gap-5 p-5 sm:p-6"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      noValidate
    >
      <div>
        <h2 className="display-sm">About you</h2>
        <p className="mt-1 text-[13.5px] text-stone">Everything here is visible to brand teams when they shortlist. Keep it in your own voice.</p>
      </div>
      {field("name", "Name", { autoComplete: "name" })}
      {field("bio", "Bio", { textarea: true, help: "One or two lines. What you film, and the feeling of it.", placeholder: "Slow mornings, honest hair routines and a lot of tea." })}
      <div className="grid gap-5 sm:grid-cols-2">
        {field("city", "City", { autoComplete: "address-level2" })}
        {field("languages", "Languages", { help: "Comma separated, e.g. English, Arabic" })}
      </div>
      {field("niches", "Niches", { help: "Comma separated. Brand teams match briefs on these, so be specific." })}

      <div className="border-t border-line pt-5">
        <h2 className="display-sm">Contact and delivery</h2>
        <p className="mt-1 text-[13.5px] text-stone">Only the Squad team sees these. Couriers get the phone and the address.</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {field("email", "Email", { type: "email", autoComplete: "email" })}
        {field("phone", "Phone", { type: "tel", autoComplete: "tel", help: "With country code." })}
      </div>
      {field("address", "Delivery address", { textarea: true, autoComplete: "street-address", help: "Product kits and rewards ship here." })}

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <button type="submit" className="btn-grass" disabled={!dirty || saving} aria-busy={saving}>
          <FloppyDisk size={18} weight="fill" /> {saving ? "Saving" : t.common.save}
        </button>
        <button type="button" className="btn-ghost" onClick={() => { setForm(fromCreator(creator)); setErrors({}); }} disabled={!dirty || saving}>
          Discard changes
        </button>
        <span className="ms-auto text-[12.5px] text-stone">{dirty ? "Unsaved changes" : "Everything is saved"}</span>
      </div>
    </form>
  );
}
