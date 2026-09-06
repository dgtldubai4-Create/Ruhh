import type { Accent, AppState, Brand, Campaign, CampaignStage, Creator, LogisticsStatus, Platform, Submission, SubmissionStatus } from "@/lib/store/types";
import { matchScore } from "@/lib/store/scoring";

/** Fixed persona for the super admin; other roles act under their role label. */
export const SUPER_ADMIN_NAME = "Reem Al Awadhi";

export const PLATFORMS: Platform[] = ["instagram", "tiktok", "youtube", "snapchat"];
export const PLATFORM_LABELS: Record<Platform, string> = { instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube", snapchat: "Snapchat" };

export const LOGISTICS_ORDER: LogisticsStatus[] = ["address_confirmed", "preparing", "dispatched", "out_for_delivery", "delivered"];

export const STAGE_ACCENT: Record<CampaignStage, Accent> = { draft: "cocoa", inviting: "sun", active: "grass", review: "berry", publishing: "sky", completed: "mint" };

export const SUBMISSION_STATUS_LABEL: Record<SubmissionStatus, string> = { analysing: "Analysing", in_review: "Waiting for review", changes_requested: "Changes requested", approved: "Approved" };

export const brandOf = (s: AppState, id: string) => s.brands.find((b) => b.id === id);
export const creatorOf = (s: AppState, id: string) => s.creators.find((c) => c.id === id);
export const campaignOf = (s: AppState, id: string) => s.campaigns.find((c) => c.id === id);

export const maxFollowers = (c: Creator) => Math.max(0, ...c.platforms.map((p) => p.followers));

/** Short label for the paper pack: "Dabur Amla" reads as "Amla" on the label. */
export const packLabel = (brand: Brand) => brand.name.replace(/^Dabur\s+/, "");

export function matchFor(s: AppState, creator: Creator, campaign: Campaign): number {
  const brand = brandOf(s, campaign.brandId);
  return matchScore({
    creatorMarket: creator.market,
    campaignMarkets: campaign.markets,
    creatorNiches: creator.niches,
    brandCategory: brand?.category ?? "",
    followers: maxFollowers(creator),
    verified: creator.verification === "verified",
    seed: creator.id + campaign.id,
  });
}

export function invitationSummary(c: Campaign) {
  const accepted = c.invitations.filter((i) => i.status === "accepted").length;
  const pending = c.invitations.filter((i) => i.status === "pending").length;
  const declined = c.invitations.filter((i) => i.status === "declined").length;
  return { accepted, pending, declined, total: c.invitations.length };
}

export const effectiveDeadline = (c: Campaign) => c.extendedDeadline ?? c.deadline;

export function avgScore(subs: Submission[]): number | null {
  const scored = subs.filter((x) => x.version > 0);
  if (!scored.length) return null;
  return Math.round(scored.reduce((a, x) => a + x.score, 0) / scored.length);
}

/** ISO date string to the value an <input type="date"> expects. */
export const toDateInput = (iso: string) => iso.slice(0, 10);
/** Date input value to an ISO timestamp at midday so time zones do not shift the day. */
export const fromDateInput = (value: string) => new Date(`${value}T12:00:00`).toISOString();

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export const ROLE_BLURB: Record<import("@/lib/store/types").AdminRole, string> = {
  super_admin: "Sees and does everything on this side, finance included.",
  brand_manager: "Runs briefs end to end: campaigns, invitations, reviews, products and the finance view.",
  campaign_manager: "Builds campaigns, moves stages and invites creators. Reviews and points stay with others.",
  content_reviewer: "Reads cuts, leaves notes, approves or asks for another pass. Nothing else.",
  logistics: "Moves parcels through the five steps. Nothing else.",
  finance: "Verifies posts, releases and adjusts points, manages reward stock and the liability view.",
};
