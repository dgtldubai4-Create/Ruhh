"use client";
import { useState } from "react";
import { ArrowSquareOut, ChatCircle, CheckCircle, Coins, Eye, Heart, HourglassMedium, LinkSimple, SealCheck } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { PaperBurst } from "@/components/motion";
import { PointsCoin } from "@/components/art/scenes";
import { SimTag, Tag } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { publishContent } from "@/lib/store/actions";
import { useLang } from "@/lib/i18n/provider";
import { cx, fmtDateTime, fmtPoints } from "@/lib/format";
import type { Campaign, Creator, LedgerEntry, Platform, Publication } from "@/lib/store/types";
import { PLATFORMS, PLATFORM_ICON, PLATFORM_LABEL, validatePostUrl } from "./helpers";

/** Platform select plus a live link with validation. Shown when the latest cut is approved. */
export function PublishForm({ campaign, creator }: { campaign: Campaign; creator: Creator }) {
  const { toast } = useToast();
  const [platform, setPlatform] = useState<Platform>(creator.platforms[0]?.platform ?? "instagram");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const ordered = [...creator.platforms.map((p) => p.platform), ...PLATFORMS.filter((p) => !creator.platforms.some((cp) => cp.platform === p))];

  const submit = () => {
    const err = validatePostUrl(url, platform);
    if (err) {
      setError(err);
      return;
    }
    setBusy(true);
    window.setTimeout(() => {
      publishContent(campaign.id, creator.id, platform, url.trim());
      setBusy(false);
      toast("Link received", "Loyalty will verify the post and release your points.");
    }, 420);
  };

  return (
    <section className="card-paper p-5 sm:p-6" aria-labelledby="publish-title">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-grass-soft" aria-hidden>
          <LinkSimple size={22} weight="bold" className="text-ink" />
        </span>
        <div>
          <h2 id="publish-title" className="display-sm">Approved. Post it and paste the link</h2>
          <p className="mt-1 text-[14px] text-stone">Publish the approved cut on your own channel, then drop the live link here. {fmtPoints(campaign.points)} points move to pending release right away.</p>
        </div>
      </div>
      <form
        className="mt-5 grid gap-4 sm:grid-cols-[200px_1fr]"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div>
          <label htmlFor="platform" className="label">
            Platform
          </label>
          <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-labelledby="platform">
            {ordered.map((p) => {
              const Icon = PLATFORM_ICON[p];
              const on = p === platform;
              return (
                <button
                  key={p}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => {
                    setPlatform(p);
                    if (error) setError(null);
                  }}
                  className={cx("inline-flex items-center gap-1.5 rounded-pill border-2 px-3 py-1.5 text-[13px] font-semibold transition-colors", on ? "border-ink bg-ink text-card" : "border-line bg-card text-ink hover:bg-paper-2")}
                >
                  <Icon size={16} weight="fill" /> {PLATFORM_LABEL[p]}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <label htmlFor="post-url" className="label">
            Live post link
          </label>
          <div className="flex gap-2">
            <input
              id="post-url"
              type="url"
              inputMode="url"
              className={cx("field", error && "field-error")}
              placeholder={`https://${platform === "youtube" ? "youtube.com/..." : `${platform}.com/...`}`}
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError(null);
              }}
              aria-invalid={Boolean(error)}
              aria-describedby="post-url-help"
            />
            <button type="submit" className="btn-grass shrink-0" disabled={busy} aria-busy={busy}>
              {busy ? "Sending" : "Send link"}
            </button>
          </div>
          {error ? (
            <p className="error-text" role="alert">{error}</p>
          ) : (
            <p id="post-url-help" className="help">
              Paste the public link to the post. Verification is simulated in this demo.
            </p>
          )}
        </div>
      </form>
    </section>
  );
}

/** The live post, mock engagement and the verification and points state. */
export function PublicationCard({ publication, campaign, ledger, burst }: { publication: Publication; campaign: Campaign; ledger?: LedgerEntry; burst: number }) {
  const { lang } = useLang();
  const reduce = useReducedMotion();
  const Icon = PLATFORM_ICON[publication.platform];
  const verified = publication.verification === "verified";
  const released = publication.pointsReleased || Boolean(ledger?.released);
  const stats = [
    { icon: Eye, label: "Views", value: publication.engagement.views },
    { icon: Heart, label: "Likes", value: publication.engagement.likes },
    { icon: ChatCircle, label: "Comments", value: publication.engagement.comments },
  ];

  return (
    <section className="relative card p-5 sm:p-6" aria-labelledby="pub-title">
      <PaperBurst trigger={burst} />
      <div className="flex flex-wrap items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-card" aria-hidden>
          <Icon size={22} weight="fill" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="pub-title" className="display-sm">Live on {PLATFORM_LABEL[publication.platform]}</h2>
          <a href={publication.url} target="_blank" rel="noreferrer" className="mt-0.5 inline-flex max-w-full items-center gap-1 truncate text-[13.5px] text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
            <span className="truncate">{publication.url}</span> <ArrowSquareOut size={14} weight="bold" className="shrink-0" />
          </a>
          <div className="mt-1 text-[12.5px] text-stone">Posted {fmtDateTime(publication.postedAt, lang)}</div>
        </div>
        <Tag outline>{verified ? <><SealCheck size={13} weight="fill" /> Verified</> : <><HourglassMedium size={13} weight="fill" /> Verification pending</>}</Tag>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
        {stats.map((st) => (
          <div key={st.label} className="rounded-input border border-line bg-paper-2/60 px-3 py-3">
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-stone">
              <st.icon size={14} weight="fill" className="text-ink" /> {st.label}
            </div>
            <div className="mt-1 font-display text-[22px] font-bold leading-none tabular">{fmtPoints(st.value)}</div>
          </div>
        ))}
      </div>
      <div className="mt-2 text-[12px] text-stone">
        <SimTag>Simulated analytics</SimTag> <span className="ms-1">Numbers are generated for the demo, not pulled from the platform.</span>
      </div>

      <div className={cx("mt-5 flex items-center gap-4 rounded-card border-2 p-4", released ? "border-ink bg-sun-soft" : "border-line bg-paper-2/60")}>
        <motion.span animate={released && !reduce ? { rotate: [0, -8, 8, 0] } : {}} transition={{ duration: 0.6 }} className="shrink-0">
          <PointsCoin size={48} spin={released && !reduce} />
        </motion.span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[14.5px] font-semibold">
            {released ? <CheckCircle size={18} weight="fill" /> : <Coins size={18} weight="fill" />}
            {released ? `${fmtPoints(campaign.points)} points released` : verified ? `${fmtPoints(campaign.points)} points verified, releasing` : `${fmtPoints(campaign.points)} points pending`}
          </div>
          <p className="mt-0.5 text-[13px] text-stone">
            {released
              ? `Moved to your available balance${ledger?.releasedAt ? ` on ${fmtDateTime(ledger.releasedAt, lang)}` : ""}. Spend them on the rewards page.`
              : verified
                ? "The post checks out. Finance releases the points in the next run, usually the same day."
                : "Loyalty checks that the post is live and matches the approved cut. Usually within two working days here."}
          </p>
        </div>
      </div>
    </section>
  );
}
