"use client";
import type { Icon } from "@phosphor-icons/react";
import { InstagramLogo, SnapchatLogo, TiktokLogo, YoutubeLogo } from "@phosphor-icons/react";
import { useAppState } from "@/lib/store/hooks";
import type { AppState, Brand, Campaign, Creator, Invitation, LedgerEntry, LogisticsStatus, ParticipationStatus, Platform, Product, Publication, Submission, SubmissionStatus } from "@/lib/store/types";
import { daysUntil } from "@/lib/format";

/* ------------------------------------------------------------------ */
/* Session helpers                                                      */
/* ------------------------------------------------------------------ */
export function useCreator(): { s: AppState; creator: Creator; creatorId: string } {
  const s = useAppState();
  const creatorId = s.session.creatorId;
  const creator = s.creators.find((c) => c.id === creatorId) ?? s.creators[0];
  return { s, creator, creatorId: creator.id };
}

export function brandOf(s: AppState, brandId: string): Brand | undefined {
  return s.brands.find((b) => b.id === brandId);
}
export function firstProductOf(s: AppState, campaign: Campaign): Product | undefined {
  return s.products.find((p) => p.id === campaign.productIds[0]);
}
/** Short label for a Pack illustration: the brand's last word, e.g. "Amla", "Vatika". */
export function packLabel(brand?: Brand): string {
  if (!brand) return "Dabur";
  const parts = brand.name.replace(/^Dabur\s+/i, "").split(" ");
  return parts[0] ?? brand.name;
}

/* ------------------------------------------------------------------ */
/* Campaign journey                                                     */
/* ------------------------------------------------------------------ */
export const JOURNEY_STEPS = ["Invited", "Brief", "Script", "Upload", "Feedback", "Publish", "Verified", "Points released"] as const;

export type Journey = {
  /** Index of the step the creator is on. 8 means every step is done. */
  current: number;
  scriptSkipped: boolean;
  invitation?: Invitation;
  latest?: Submission;
  draft?: Submission;
  submissions: Submission[];
  publication?: Publication;
  ledger?: LedgerEntry;
  declined: boolean;
  pending: boolean;
  accepted: boolean;
  complete: boolean;
};

export function campaignJourney(s: AppState, campaign: Campaign, creatorId: string): Journey {
  const invitation = campaign.invitations.find((i) => i.creatorId === creatorId);
  const all = s.submissions.filter((x) => x.campaignId === campaign.id && x.creatorId === creatorId);
  const draft = all.find((x) => x.version === 0);
  const submissions = all.filter((x) => x.version > 0).sort((a, b) => b.version - a.version);
  const latest = submissions[0];
  const publication = s.publications.find((p) => p.campaignId === campaign.id && p.creatorId === creatorId);
  const ledger = s.ledger.find((l) => l.creatorId === creatorId && l.refId === campaign.id && l.type === "earned");
  const declined = invitation?.status === "declined";
  const pending = invitation?.status === "pending";
  const accepted = invitation?.status === "accepted";
  const hasScript = Boolean((latest?.script ?? draft?.script)?.trim());
  let current = 0;
  if (accepted) {
    if (publication?.pointsReleased || ledger?.released) current = 8;
    else if (publication?.verification === "verified") current = 7;
    else if (publication) current = 6;
    else if (latest?.status === "approved") current = 5;
    else if (latest) current = 4;
    else if (hasScript) current = 3;
    else current = 1;
  }
  return { current, scriptSkipped: Boolean(latest) && !hasScript, invitation, latest, draft, submissions, publication, ledger, declined, pending, accepted, complete: current >= 8 };
}

export function effectiveDeadline(c: Campaign): string {
  return c.extendedDeadline ?? c.deadline;
}

/** Human deadline phrase from a date. */
export function deadlineLabel(iso: string): string {
  const d = daysUntil(iso);
  if (d < -1) return `${Math.abs(d)} days past`;
  if (d === -1) return "Yesterday";
  if (d === 0) return "Today";
  if (d === 1) return "Tomorrow";
  if (d <= 14) return `${d} days left`;
  return `in ${d} days`;
}

/* ------------------------------------------------------------------ */
/* Labels                                                               */
/* ------------------------------------------------------------------ */
export const SUBMISSION_LABEL: Record<SubmissionStatus, string> = {
  analysing: "Analysing",
  in_review: "In review",
  changes_requested: "Changes requested",
  approved: "Approved",
};

export const PARTICIPATION_LABEL: Record<ParticipationStatus | "available", string> = {
  available: "Available",
  joined: "Joined",
  submitted: "Submitted",
  in_review: "In review",
  completed: "Completed",
};

export const PLATFORM_LABEL: Record<Platform, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  snapchat: "Snapchat",
};
export const PLATFORM_ICON: Record<Platform, Icon> = {
  instagram: InstagramLogo,
  tiktok: TiktokLogo,
  youtube: YoutubeLogo,
  snapchat: SnapchatLogo,
};
export const PLATFORM_HOSTS: Record<Platform, string[]> = {
  instagram: ["instagram.com"],
  tiktok: ["tiktok.com"],
  youtube: ["youtube.com", "youtu.be"],
  snapchat: ["snapchat.com"],
};
export const PLATFORMS: Platform[] = ["instagram", "tiktok", "youtube", "snapchat"];

export const LOGISTICS_ORDER: LogisticsStatus[] = ["address_confirmed", "preparing", "dispatched", "out_for_delivery", "delivered"];

/** Validate a live post URL for the chosen platform. Returns an error string or null. */
export function validatePostUrl(url: string, platform: Platform): string | null {
  const trimmed = url.trim();
  if (!trimmed) return "Paste the link to your live post.";
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return "That does not look like a full link. Start with https://";
  }
  if (parsed.protocol !== "https:") return "Use the https:// version of the link.";
  const host = parsed.hostname.replace(/^www\./, "");
  const ok = PLATFORM_HOSTS[platform].some((h) => host === h || host.endsWith(`.${h}`));
  if (!ok) return `That link is not on ${PLATFORM_LABEL[platform]}. Check the platform or the link.`;
  return null;
}

export function validateEmail(v: string): string | null {
  if (!v.trim()) return "We need an email to send campaign updates.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return "That email is missing something. Check the @ and the domain.";
  return null;
}
export function validatePhone(v: string): string | null {
  if (!v.trim()) return "Couriers call before delivery, so a phone number helps.";
  if (v.replace(/[^\d]/g, "").length < 8) return "That number looks short. Include the country code.";
  return null;
}
export function validateAddress(v: string): string | null {
  if (v.trim().length < 8) return "Add a street or area so the courier can find you.";
  return null;
}
