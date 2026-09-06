"use client";
import { useState } from "react";
import { CheckCircle, Hourglass, InstagramLogo, MapPin, PaperPlaneTilt, SnapchatLogo, Star, TiktokLogo, Warning, YoutubeLogo, type Icon } from "@phosphor-icons/react";
import type { AppState, Campaign, Creator, Platform, Verification } from "@/lib/store/types";
import { inviteCreator, setVerification, simulate, toggleShortlist } from "@/lib/store/actions";
import { useLang } from "@/lib/i18n/provider";
import { cx, fmtDate, fmtFollowers } from "@/lib/format";
import { Avatar, SimTag, Tag } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { Art } from "@/components/art/scenes";
import { ExpandRow } from "./expand-row";
import { KV } from "./section";
import { RoleNotice, useActor } from "./role-gate";
import { avgScore, brandOf, maxFollowers, PLATFORM_LABELS } from "./helpers";
import { StageTag } from "./stage-board";

const PORTRAITS: Record<string, "portraitLayla" | "portraitOmar" | "portraitNoor"> = { cr_layla: "portraitLayla", cr_omar: "portraitOmar", cr_noor: "portraitNoor" };
const PLATFORM_ICON: Record<Platform, Icon> = { instagram: InstagramLogo, tiktok: TiktokLogo, youtube: YoutubeLogo, snapchat: SnapchatLogo };
const VERIFICATIONS: Verification[] = ["verified", "pending", "unverified"];
const VERIFICATION_LABEL: Record<Verification, string> = { verified: "Verified", pending: "Pending", unverified: "Unverified" };

export function Portrait({ c, size = 48 }: { c: Creator; size?: number }) {
  const art = PORTRAITS[c.id];
  if (!art) return <Avatar initials={c.avatar.initials} tone={c.avatar.tone} size={size} />;
  return (
    <span className="inline-block shrink-0 overflow-hidden rounded-full" style={{ width: size, height: size }}>
      <Art id={art} alt="" className="h-full w-full" fallback={<Avatar initials={c.avatar.initials} tone={c.avatar.tone} size={size} />} />
    </span>
  );
}

export function VerificationMark({ v, withLabel }: { v: Verification; withLabel?: boolean }) {
  const Icon = v === "verified" ? CheckCircle : v === "pending" ? Hourglass : Warning;
  return (
    <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-ink" title={VERIFICATION_LABEL[v]}>
      <Icon size={16} weight="fill" aria-hidden />
      {withLabel ? VERIFICATION_LABEL[v] : <span className="sr-only">{VERIFICATION_LABEL[v]}</span>}
    </span>
  );
}

export function CreatorRow({ s, c, open, onToggle, campaign, match, campaignOptions }: {
  s: AppState;
  c: Creator;
  open: boolean;
  onToggle: () => void;
  campaign?: Campaign;
  match?: number;
  campaignOptions: Campaign[];
}) {
  const { t, lang } = useLang();
  const { actor, allowed } = useActor();
  const { toast } = useToast();
  const [target, setTarget] = useState<string>(campaign?.id ?? "");
  const [busy, setBusy] = useState<string | null>(null);

  const inviteTo = campaign ?? campaignOptions.find((x) => x.id === target);
  const alreadyInvited = inviteTo ? inviteTo.invitations.some((i) => i.creatorId === c.id) : false;
  const past = s.campaigns.filter((x) => x.invitations.some((i) => i.creatorId === c.id));
  const subs = s.submissions.filter((x) => x.creatorId === c.id);
  const avg = avgScore(subs);

  async function invite() {
    if (!inviteTo || alreadyInvited) return;
    setBusy("invite");
    await simulate(() => inviteCreator(inviteTo.id, c.id, actor));
    setBusy(null);
    toast(`${c.name.split(" ")[0]} invited`, `${inviteTo.title}. The creator gets a simulated in-app notification.`);
  }
  async function verify(v: Verification) {
    if (v === c.verification) return;
    setBusy(v);
    await simulate(() => setVerification(c.id, v, actor));
    setBusy(null);
    toast(`${c.name.split(" ")[0]} is now ${VERIFICATION_LABEL[v].toLowerCase()}`, "The creator gets a simulated email.");
  }

  return (
    <ExpandRow
      open={open}
      onToggle={onToggle}
      summary={
        <div className="flex items-center gap-3">
          <Portrait c={c} size={44} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="font-display text-[16px] font-bold leading-tight">{c.name}</span>
              <VerificationMark v={c.verification} />
              {c.shortlisted && <Tag accent="sun">Shortlisted</Tag>}
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[13px] text-stone">
              <span>{c.handle}</span>
              <span className="inline-flex items-center gap-0.5"><MapPin size={13} weight="bold" aria-hidden />{c.city}, {c.market}</span>
              <span className="hidden sm:inline tabular">{fmtFollowers(maxFollowers(c))} top reach</span>
            </div>
          </div>
          <div className="hidden flex-wrap justify-end gap-1 md:flex">
            {c.niches.slice(0, 3).map((n) => (
              <Tag key={n} outline>{n}</Tag>
            ))}
          </div>
          {typeof match === "number" && (
            <div className="flex shrink-0 flex-col items-center rounded-input bg-paper-2 px-2.5 py-1.5" title="Match score, simulated">
              <span className="font-display text-[18px] font-bold leading-none tabular">{match}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-stone">match</span>
            </div>
          )}
        </div>
      }
      actions={
        <button
          type="button"
          className={cx("inline-flex h-9 w-9 items-center justify-center rounded-pill border transition-colors", c.shortlisted ? "border-ink bg-sun text-paper" : "border-line bg-card text-stone hover:bg-paper-2")}
          aria-pressed={!!c.shortlisted}
          aria-label={c.shortlisted ? `Remove ${c.name} from the shortlist` : `Shortlist ${c.name}`}
          onClick={() => {
            toggleShortlist(c.id);
            toast(c.shortlisted ? "Removed from shortlist" : "Added to shortlist", c.name, "info");
          }}
        >
          <Star size={18} weight={c.shortlisted ? "fill" : "regular"} />
        </button>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <div className="flex flex-col gap-4">
          <p className="text-[15px] leading-relaxed">{c.bio}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <KV label="Platforms">
              <ul className="flex flex-col gap-1">
                {c.platforms.map((p) => {
                  const Icon = PLATFORM_ICON[p.platform];
                  return (
                    <li key={p.platform} className="flex items-center gap-2">
                      <Icon size={18} weight="fill" aria-hidden />
                      <span>{PLATFORM_LABELS[p.platform]}</span>
                      <span className="ms-auto font-semibold tabular">{fmtFollowers(p.followers)}</span>
                    </li>
                  );
                })}
              </ul>
            </KV>
            <div className="flex flex-col gap-4">
              <KV label="Languages">{c.languages.join(", ")}</KV>
              <KV label="Niches">
                <div className="flex flex-wrap gap-1">
                  {c.niches.map((n) => (
                    <Tag key={n} outline>{n}</Tag>
                  ))}
                </div>
              </KV>
            </div>
            <KV label="Advertiser licence">
              <span className="me-2 font-mono text-[13.5px]">{c.licenceId}</span>
              <SimTag>Prototype id</SimTag>
            </KV>
            <KV label="Joined">{fmtDate(c.joinedAt, lang)}, {c.email}</KV>
          </div>
          <KV label={`Past campaigns (${past.length})`}>
            {past.length === 0 ? (
              <span className="text-stone">No invitations yet.</span>
            ) : (
              <ul className="flex flex-col divide-y divide-line">
                {past.map((x) => {
                  const inv = x.invitations.find((i) => i.creatorId === c.id);
                  const brand = brandOf(s, x.brandId);
                  return (
                    <li key={x.id} className="flex flex-wrap items-center gap-2 py-1.5">
                      <span className="font-semibold">{x.title}</span>
                      <span className="text-[12.5px] text-stone">{brand?.name}</span>
                      <span className="ms-auto flex items-center gap-1.5">
                        <Tag outline>{inv?.status === "accepted" ? t.common.accepted : inv?.status === "declined" ? t.common.declined : t.common.pending}</Tag>
                        <StageTag stage={x.stage} />
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </KV>
          <KV label="Average simulated score">
            {avg === null ? <span className="text-stone">No cuts uploaded yet.</span> : <span><span className="font-display text-[20px] font-bold tabular">{avg}</span> <span className="text-stone">across {subs.length} {subs.length === 1 ? "cut" : "cuts"}</span></span>}
          </KV>
        </div>

        <div className="flex flex-col gap-4 rounded-card bg-paper-2 p-4">
          <div>
            <div className="label">Invite to a campaign</div>
            {!campaign && (
              <select className="field mb-2" value={target} onChange={(e) => setTarget(e.target.value)} aria-label="Campaign to invite to" disabled={!allowed("creator.invite")}>
                <option value="">Choose a campaign</option>
                {campaignOptions.map((x) => (
                  <option key={x.id} value={x.id}>{x.title}</option>
                ))}
              </select>
            )}
            {campaign && <p className="mb-2 text-[13.5px] text-stone">Sorting by match for <span className="font-semibold text-ink">{campaign.title}</span>.</p>}
            {allowed("creator.invite") ? (
              <button type="button" className="btn-grass btn-sm" onClick={invite} disabled={!inviteTo || alreadyInvited || busy === "invite"} aria-busy={busy === "invite"}>
                <PaperPlaneTilt size={16} weight="bold" />
                {alreadyInvited ? "Already invited" : busy === "invite" ? "Sending" : "Send invitation"}
              </button>
            ) : (
              <RoleNotice cap="creator.invite" />
            )}
          </div>
          <div>
            <div className="label">Verification</div>
            {allowed("creator.verify") ? (
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Verification">
                {VERIFICATIONS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={c.verification === v}
                    disabled={busy === v}
                    onClick={() => verify(v)}
                    className={cx("rounded-pill border px-3 py-1.5 text-[13px] font-semibold transition-colors", c.verification === v ? "border-ink bg-ink text-paper" : "border-line bg-card hover:bg-paper-3")}
                  >
                    {VERIFICATION_LABEL[v]}
                  </button>
                ))}
              </div>
            ) : (
              <>
                <VerificationMark v={c.verification} withLabel />
                <RoleNotice cap="creator.verify" className="mt-2" />
              </>
            )}
          </div>
        </div>
      </div>
    </ExpandRow>
  );
}
