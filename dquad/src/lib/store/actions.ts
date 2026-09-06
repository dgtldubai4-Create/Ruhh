import { store } from "./store";
import type { AdminRole, AppState, Campaign, CampaignStage, LogisticsStatus, Market, Platform, Session, Submission } from "./types";
import { scoreSubmission, CRITERIA } from "./scoring";

/* ------------------------------------------------------------------ */
/* helpers                                                              */
/* ------------------------------------------------------------------ */
let counter = 0;
export const uid = (prefix: string) => `${prefix}_${Date.now().toString(36)}${(counter++).toString(36)}`;
const now = () => new Date().toISOString();

function pushNotification(s: AppState, n: Omit<AppState["notifications"][number], "id" | "at" | "read">) {
  s.notifications.unshift({ id: uid("n"), at: now(), read: false, ...n });
}
function pushActivity(s: AppState, actor: string, text: string) {
  s.activity.unshift({ id: uid("a"), actor, text, at: now() });
}
function mutate(fn: (draft: AppState) => void) {
  store.set((prev) => {
    const draft = structuredClone(prev);
    fn(draft);
    return draft;
  });
}
const creatorName = (s: AppState, id: string) => s.creators.find((c) => c.id === id)?.name ?? "A creator";

/** Simulated network latency so loading states are real. */
export function simulate<T>(fn: () => T, ms = 420): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(fn()), ms));
}

/* ------------------------------------------------------------------ */
/* session                                                              */
/* ------------------------------------------------------------------ */
export function setSession(patch: Partial<Session>) {
  mutate((s) => {
    s.session = { ...s.session, ...patch };
  });
}
export function setAdminRole(role: AdminRole) {
  mutate((s) => {
    s.session.adminRole = role;
    s.session.mode = "admin";
  });
}
export function resetDemo() {
  store.reset();
}

/* ------------------------------------------------------------------ */
/* creator: invitations, submissions, publishing                        */
/* ------------------------------------------------------------------ */
export function respondToInvitation(campaignId: string, creatorId: string, decision: "accepted" | "declined") {
  mutate((s) => {
    const c = s.campaigns.find((x) => x.id === campaignId);
    if (!c) return;
    const inv = c.invitations.find((i) => i.creatorId === creatorId);
    if (!inv || inv.status !== "pending") return;
    inv.status = decision;
    inv.respondedAt = now();
    const name = creatorName(s, creatorId);
    pushActivity(s, name, `${decision} the invitation to ${c.title}`);
    if (decision === "accepted") {
      if (c.stage === "inviting") c.stage = "active";
      const creator = s.creators.find((x) => x.id === creatorId);
      s.shipments.unshift({
        id: uid("sh"), creatorId, kind: "product_kit", label: `${c.title} product kit`, refId: c.id,
        status: "address_confirmed", courier: "Aramex (simulated)", tracking: `SIM-${creator?.market ?? "AE"}-${Math.floor(10_000_000 + Math.random() * 89_999_999)}`,
        address: creator?.address ?? "", history: [{ status: "address_confirmed", at: now() }],
      });
      pushNotification(s, { audience: "creator", creatorId, channel: "email", title: `You are in: ${c.title}`, body: "Your product kit is being prepared. The brief is unlocked in your campaign page.", href: `/creator/campaigns/${c.id}` });
      pushNotification(s, { audience: "admin", channel: "in_app", title: `${name} accepted ${c.title}`, body: "A product kit was queued for logistics.", href: "/admin/logistics" });
    } else {
      pushNotification(s, { audience: "admin", channel: "in_app", title: `${name} declined ${c.title}`, body: "Consider inviting another creator from the shortlist.", href: `/admin/campaigns/${c.id}` });
    }
  });
}

export function saveScript(campaignId: string, creatorId: string, script: string) {
  mutate((s) => {
    const latest = latestSubmission(s, campaignId, creatorId);
    if (latest) latest.script = script;
    else {
      s.submissions.push({
        id: uid("s"), campaignId, creatorId, version: 0, fileName: "", fileSize: 0, uploadedAt: now(), score: 0, breakdown: [], status: "analysing", comments: [], script,
      });
    }
  });
}

export function latestSubmission(s: AppState, campaignId: string, creatorId: string): Submission | undefined {
  return s.submissions
    .filter((x) => x.campaignId === campaignId && x.creatorId === creatorId)
    .sort((a, b) => b.version - a.version)[0];
}

export function uploadSubmission(campaignId: string, creatorId: string, fileName: string, fileSize: number) {
  let created: Submission | undefined;
  mutate((s) => {
    const c = s.campaigns.find((x) => x.id === campaignId);
    if (!c) return;
    const prev = s.submissions.filter((x) => x.campaignId === campaignId && x.creatorId === creatorId);
    const draft = prev.find((x) => x.version === 0);
    const version = Math.max(0, ...prev.map((x) => x.version)) + 1;
    const { score, breakdown } = scoreSubmission(fileName, c.criteria.length ? c.criteria : CRITERIA);
    created = {
      id: uid("s"), campaignId, creatorId, version, fileName, fileSize, uploadedAt: now(), score, breakdown, status: "in_review", comments: [], script: draft?.script ?? prev.at(-1)?.script,
    };
    if (draft) s.submissions = s.submissions.filter((x) => x.id !== draft.id);
    s.submissions.push(created);
    if (c.stage === "active") c.stage = "review";
    pushActivity(s, creatorName(s, creatorId), `uploaded v${version} for ${c.title}`);
    pushNotification(s, { audience: "admin", channel: "in_app", title: `New cut for ${c.title}`, body: `${creatorName(s, creatorId)} uploaded v${version}. Simulated score ${score}.`, href: "/admin/review" });
  });
  return created;
}

export function addComment(submissionId: string, author: string, role: "creator" | "reviewer", text: string) {
  mutate((s) => {
    const sub = s.submissions.find((x) => x.id === submissionId);
    if (!sub) return;
    sub.comments.push({ id: uid("cm"), author, role, text, at: now() });
    const c = s.campaigns.find((x) => x.id === sub.campaignId);
    if (role === "reviewer") {
      pushNotification(s, { audience: "creator", creatorId: sub.creatorId, channel: "in_app", title: `New note on ${c?.title ?? "your cut"} v${sub.version}`, body: text.slice(0, 120), href: `/creator/campaigns/${sub.campaignId}` });
    } else {
      pushNotification(s, { audience: "admin", channel: "in_app", title: `${author} replied on ${c?.title ?? "a submission"}`, body: text.slice(0, 120), href: "/admin/review" });
    }
  });
}

export function reviewSubmission(submissionId: string, reviewer: string, decision: "approved" | "changes_requested", note?: string) {
  mutate((s) => {
    const sub = s.submissions.find((x) => x.id === submissionId);
    if (!sub) return;
    sub.status = decision;
    sub.reviewedBy = reviewer;
    if (note) sub.comments.push({ id: uid("cm"), author: reviewer, role: "reviewer", text: note, at: now() });
    const c = s.campaigns.find((x) => x.id === sub.campaignId);
    if (c && decision === "approved") {
      c.stage = "publishing";
      const existing = s.ledger.find((l) => l.creatorId === sub.creatorId && l.refId === c.id && l.type === "earned");
      if (!existing) {
        s.ledger.unshift({ id: uid("l"), creatorId: sub.creatorId, type: "earned", points: c.points, note: `Campaign: ${c.title} (pending publish and verification)`, at: now(), released: false, refId: c.id });
      }
    }
    pushActivity(s, reviewer, `${decision === "approved" ? "approved" : "requested changes on"} ${creatorName(s, sub.creatorId)}'s v${sub.version} for ${c?.title}`);
    pushNotification(s, {
      audience: "creator", creatorId: sub.creatorId, channel: "email",
      title: decision === "approved" ? `${c?.title}: approved` : `${c?.title}: one more pass`,
      body: decision === "approved" ? "Publish it and paste the live link to move your points to pending release." : note ?? "The reviewer left notes on your cut.",
      href: `/creator/campaigns/${sub.campaignId}`,
    });
  });
}

export function publishContent(campaignId: string, creatorId: string, platform: Platform, url: string) {
  mutate((s) => {
    const c = s.campaigns.find((x) => x.id === campaignId);
    if (!c) return;
    const seed = url.length * 7919;
    s.publications.push({
      id: uid("pub"), campaignId, creatorId, platform, url, postedAt: now(),
      engagement: { views: 12_000 + (seed % 90_000), likes: 800 + (seed % 6_000), comments: 40 + (seed % 400) },
      verification: "pending", pointsReleased: false,
    });
    pushActivity(s, creatorName(s, creatorId), `posted ${c.title} on ${platform}, awaiting verification`);
    pushNotification(s, { audience: "admin", channel: "in_app", title: `Verify post: ${c.title}`, body: `${creatorName(s, creatorId)} shared a live link on ${platform}.`, href: "/admin/loyalty" });
    pushNotification(s, { audience: "creator", creatorId, channel: "in_app", title: "Link received", body: "Loyalty will verify the post and release your points. Usually within two working days in this simulation.", href: `/creator/campaigns/${campaignId}` });
  });
}

export function verifyPublication(publicationId: string, actor: string) {
  mutate((s) => {
    const pub = s.publications.find((p) => p.id === publicationId);
    if (!pub) return;
    pub.verification = "verified";
    const c = s.campaigns.find((x) => x.id === pub.campaignId);
    pushActivity(s, actor, `verified ${creatorName(s, pub.creatorId)}'s post for ${c?.title}`);
  });
}

export function releasePoints(publicationId: string, actor: string) {
  mutate((s) => {
    const pub = s.publications.find((p) => p.id === publicationId);
    if (!pub || pub.verification !== "verified" || pub.pointsReleased) return;
    pub.pointsReleased = true;
    const entry = s.ledger.find((l) => l.creatorId === pub.creatorId && l.refId === pub.campaignId && l.type === "earned");
    const c = s.campaigns.find((x) => x.id === pub.campaignId);
    if (entry) {
      entry.released = true;
      entry.releasedAt = now();
      entry.note = `Campaign: ${c?.title ?? ""}`;
    } else if (c) {
      s.ledger.unshift({ id: uid("l"), creatorId: pub.creatorId, type: "earned", points: c.points, note: `Campaign: ${c.title}`, at: now(), released: true, releasedAt: now(), refId: c.id });
    }
    if (c) {
      const allDone = c.invitations.filter((i) => i.status === "accepted").every((i) => s.publications.some((p) => p.campaignId === c.id && p.creatorId === i.creatorId && p.pointsReleased));
      if (allDone) c.stage = "completed";
    }
    pushActivity(s, actor, `released ${c?.points ?? 0} points to ${creatorName(s, pub.creatorId)}`);
    pushNotification(s, { audience: "creator", creatorId: pub.creatorId, channel: "email", title: `${c?.points ?? 0} points are yours`, body: `${c?.title} is verified. Your points moved from pending to available.`, href: "/creator/rewards" });
  });
}

export function adjustPoints(creatorId: string, points: number, note: string, actor: string) {
  mutate((s) => {
    s.ledger.unshift({ id: uid("l"), creatorId, type: "adjustment", points, note, at: now(), released: true, releasedAt: now() });
    pushActivity(s, actor, `adjusted ${creatorName(s, creatorId)}'s balance by ${points > 0 ? "+" : ""}${points}`);
    pushNotification(s, { audience: "creator", creatorId, channel: "in_app", title: "Balance adjusted", body: note, href: "/creator/rewards" });
  });
}

/* ------------------------------------------------------------------ */
/* quests                                                               */
/* ------------------------------------------------------------------ */
export function joinQuest(questId: string, creatorId: string) {
  mutate((s) => {
    if (s.participations.some((p) => p.questId === questId && p.creatorId === creatorId)) return;
    s.participations.push({ questId, creatorId, status: "joined", joinedAt: now() });
    const q = s.quests.find((x) => x.id === questId);
    pushActivity(s, creatorName(s, creatorId), `joined the side quest ${q?.title}`);
  });
}

export function submitQuest(questId: string, creatorId: string, text: string, fileName?: string, answer?: number) {
  mutate((s) => {
    const p = s.participations.find((x) => x.questId === questId && x.creatorId === creatorId);
    const q = s.quests.find((x) => x.id === questId);
    if (!p || !q) return;
    p.submission = { text, fileName, at: now(), answer };
    if (q.question) {
      const correct = answer === q.question.answer;
      p.status = "completed";
      p.feedback = correct ? "Correct. Points added." : `Not quite. The answer was "${q.question.options[q.question.answer]}". Points added for finishing.`;
      s.ledger.unshift({ id: uid("l"), creatorId, type: "earned", points: q.points, note: `Side quest: ${q.title}`, at: now(), released: true, releasedAt: now(), refId: q.id });
      pushNotification(s, { audience: "creator", creatorId, channel: "in_app", title: `${q.points} points for ${q.title}`, body: p.feedback, href: "/creator/rewards" });
    } else {
      p.status = "in_review";
      s.ledger.unshift({ id: uid("l"), creatorId, type: "earned", points: q.points, note: `Side quest: ${q.title} (in review)`, at: now(), released: false, refId: q.id });
      pushNotification(s, { audience: "admin", channel: "in_app", title: `Quest submission: ${q.title}`, body: `${creatorName(s, creatorId)} submitted. Review to release ${q.points} points.`, href: "/admin/loyalty" });
    }
    pushActivity(s, creatorName(s, creatorId), `submitted the side quest ${q.title}`);
  });
}

export function completeQuest(questId: string, creatorId: string, actor: string, feedback: string) {
  mutate((s) => {
    const p = s.participations.find((x) => x.questId === questId && x.creatorId === creatorId);
    const q = s.quests.find((x) => x.id === questId);
    if (!p || !q) return;
    p.status = "completed";
    p.feedback = feedback;
    const entry = s.ledger.find((l) => l.creatorId === creatorId && l.refId === q.id);
    if (entry) {
      entry.released = true;
      entry.releasedAt = now();
      entry.note = `Side quest: ${q.title}`;
    } else {
      s.ledger.unshift({ id: uid("l"), creatorId, type: "earned", points: q.points, note: `Side quest: ${q.title}`, at: now(), released: true, releasedAt: now(), refId: q.id });
    }
    pushActivity(s, actor, `completed ${creatorName(s, creatorId)}'s ${q.title} quest`);
    pushNotification(s, { audience: "creator", creatorId, channel: "in_app", title: `${q.title}: complete`, body: feedback, href: "/creator/quests" });
  });
}

/* ------------------------------------------------------------------ */
/* rewards and logistics                                                */
/* ------------------------------------------------------------------ */
export function redeemReward(rewardId: string, creatorId: string, address: string): { ok: boolean; reason?: string } {
  let result: { ok: boolean; reason?: string } = { ok: false, reason: "unknown" };
  mutate((s) => {
    const r = s.rewards.find((x) => x.id === rewardId);
    const creator = s.creators.find((x) => x.id === creatorId);
    if (!r || !creator) return;
    if (r.stock <= 0) {
      result = { ok: false, reason: "out_of_stock" };
      return;
    }
    const available = balances(s, creatorId).available;
    if (available < r.points) {
      result = { ok: false, reason: "insufficient" };
      return;
    }
    r.stock -= 1;
    const shId = uid("sh");
    s.ledger.unshift({ id: uid("l"), creatorId, type: "spent", points: r.points, note: `Redeemed: ${r.name}`, at: now(), released: true, refId: r.id });
    s.redemptions.unshift({ id: uid("rd"), creatorId, rewardId, points: r.points, at: now(), shipmentId: shId });
    s.shipments.unshift({ id: shId, creatorId, kind: "reward", label: r.name, refId: r.id, status: "address_confirmed", courier: creator.market === "KSA" ? "SMSA (simulated)" : "Aramex (simulated)", tracking: `SIM-${creator.market === "KSA" ? "SA" : "AE"}-${Math.floor(10_000_000 + Math.random() * 89_999_999)}`, address, history: [{ status: "address_confirmed", at: now() }] });
    creator.address = address;
    pushActivity(s, creator.name, `redeemed ${r.name} for ${r.points} points`);
    pushNotification(s, { audience: "creator", creatorId, channel: "email", title: `Order confirmed: ${r.name}`, body: `${r.points} points spent. We will let you know when it ships.`, href: "/creator/rewards#deliveries" });
    pushNotification(s, { audience: "admin", channel: "in_app", title: `New redemption: ${r.name}`, body: `${creator.name} redeemed. Logistics has a new parcel.`, href: "/admin/logistics" });
    result = { ok: true };
  });
  return result;
}

const LOGISTICS_ORDER: LogisticsStatus[] = ["address_confirmed", "preparing", "dispatched", "out_for_delivery", "delivered"];
export function nextLogisticsStatus(status: LogisticsStatus): LogisticsStatus | null {
  const i = LOGISTICS_ORDER.indexOf(status);
  return i >= 0 && i < LOGISTICS_ORDER.length - 1 ? LOGISTICS_ORDER[i + 1] : null;
}
export function advanceShipment(shipmentId: string, actor: string) {
  mutate((s) => {
    const sh = s.shipments.find((x) => x.id === shipmentId);
    if (!sh) return;
    const next = nextLogisticsStatus(sh.status);
    if (!next) return;
    sh.status = next;
    sh.history.push({ status: next, at: now() });
    const label: Record<LogisticsStatus, string> = {
      address_confirmed: "Address confirmed", preparing: "Being prepared", dispatched: "Dispatched", out_for_delivery: "Out for delivery", delivered: "Delivered",
    };
    pushActivity(s, actor, `moved ${creatorName(s, sh.creatorId)}'s ${sh.label} to ${label[next]}`);
    pushNotification(s, { audience: "creator", creatorId: sh.creatorId, channel: next === "dispatched" || next === "delivered" ? "email" : "in_app", title: `${sh.label}: ${label[next]}`, body: next === "delivered" ? "Enjoy. Tell us how it lands in your next post." : `${sh.courier}. Tracking ${sh.tracking}.`, href: "/creator/rewards#deliveries" });
  });
}

export function updateRewardStock(rewardId: string, stock: number, actor: string) {
  mutate((s) => {
    const r = s.rewards.find((x) => x.id === rewardId);
    if (!r) return;
    r.stock = Math.max(0, stock);
    pushActivity(s, actor, `set ${r.name} stock to ${r.stock}`);
  });
}

/* ------------------------------------------------------------------ */
/* profile and notifications                                            */
/* ------------------------------------------------------------------ */
export function updateProfile(creatorId: string, patch: Partial<Pick<AppState["creators"][number], "name" | "bio" | "city" | "languages" | "niches" | "phone" | "email" | "address">>) {
  mutate((s) => {
    const c = s.creators.find((x) => x.id === creatorId);
    if (c) Object.assign(c, patch);
  });
}
export function markNotificationsRead(audience: "creator" | "admin", creatorId?: string) {
  mutate((s) => {
    s.notifications.forEach((n) => {
      if (n.audience === audience && (audience === "admin" || n.creatorId === creatorId)) n.read = true;
    });
  });
}
export function markNotificationRead(id: string) {
  mutate((s) => {
    const n = s.notifications.find((x) => x.id === id);
    if (n) n.read = true;
  });
}

/* ------------------------------------------------------------------ */
/* admin: campaigns and creators                                        */
/* ------------------------------------------------------------------ */
export type CampaignInput = Pick<Campaign, "title" | "brandId" | "productIds" | "markets" | "objective" | "mustHave" | "avoid" | "tone" | "deliverable" | "deadline" | "points">;

export function createCampaign(input: CampaignInput, owner: string): string {
  const id = uid("c");
  mutate((s) => {
    s.campaigns.unshift({ id, ...input, stage: "draft", criteria: CRITERIA, invitations: [], createdAt: now(), ownerName: owner });
    pushActivity(s, owner, `created ${input.title} as a draft`);
  });
  return id;
}
export function updateCampaign(id: string, patch: Partial<CampaignInput & { extendedDeadline: string }>, actor: string) {
  mutate((s) => {
    const c = s.campaigns.find((x) => x.id === id);
    if (!c) return;
    Object.assign(c, patch);
    pushActivity(s, actor, `edited ${c.title}`);
  });
}
export function deleteCampaign(id: string, actor: string) {
  mutate((s) => {
    const c = s.campaigns.find((x) => x.id === id);
    if (!c || c.stage !== "draft") return;
    s.campaigns = s.campaigns.filter((x) => x.id !== id);
    pushActivity(s, actor, `deleted the draft ${c.title}`);
  });
}
export const STAGES: CampaignStage[] = ["draft", "inviting", "active", "review", "publishing", "completed"];
export function setCampaignStage(id: string, stage: CampaignStage, actor: string) {
  mutate((s) => {
    const c = s.campaigns.find((x) => x.id === id);
    if (!c) return;
    c.stage = stage;
    pushActivity(s, actor, `moved ${c.title} to ${stage}`);
  });
}
export function extendDeadline(id: string, extendedDeadline: string, actor: string) {
  mutate((s) => {
    const c = s.campaigns.find((x) => x.id === id);
    if (!c) return;
    c.extendedDeadline = extendedDeadline;
    pushActivity(s, actor, `extended ${c.title} to ${new Date(extendedDeadline).toLocaleDateString("en-GB")}`);
    c.invitations.filter((i) => i.status === "accepted").forEach((i) => {
      pushNotification(s, { audience: "creator", creatorId: i.creatorId, channel: "in_app", title: `${c.title}: more time`, body: `The deadline moved to ${new Date(extendedDeadline).toLocaleDateString("en-GB")}.`, href: `/creator/campaigns/${c.id}` });
    });
  });
}
export function inviteCreator(campaignId: string, creatorId: string, actor: string) {
  mutate((s) => {
    const c = s.campaigns.find((x) => x.id === campaignId);
    if (!c || c.invitations.some((i) => i.creatorId === creatorId)) return;
    c.invitations.push({ creatorId, status: "pending", sentAt: now() });
    if (c.stage === "draft") c.stage = "inviting";
    pushActivity(s, actor, `invited ${creatorName(s, creatorId)} to ${c.title}`);
    pushNotification(s, { audience: "creator", creatorId, channel: "in_app", title: `New invitation: ${c.title}`, body: `${actor} invited you. Read the brief and reply when you are ready.`, href: `/creator/campaigns/${c.id}` });
  });
}
export function toggleShortlist(creatorId: string) {
  mutate((s) => {
    const c = s.creators.find((x) => x.id === creatorId);
    if (c) c.shortlisted = !c.shortlisted;
  });
}
export function setVerification(creatorId: string, verification: AppState["creators"][number]["verification"], actor: string) {
  mutate((s) => {
    const c = s.creators.find((x) => x.id === creatorId);
    if (!c) return;
    c.verification = verification;
    pushActivity(s, actor, `set ${c.name}'s verification to ${verification}`);
    pushNotification(s, { audience: "creator", creatorId, channel: "email", title: `Profile ${verification}`, body: verification === "verified" ? "Your identity and licence details are verified. Campaigns across both markets are open to you." : "A member of the team updated your verification state.", href: "/creator/profile" });
  });
}
export function toggleKsa(productId: string) {
  mutate((s) => {
    const p = s.products.find((x) => x.id === productId);
    if (p) p.ksaAvailable = !p.ksaAvailable;
  });
}

/* ------------------------------------------------------------------ */
/* balances                                                             */
/* ------------------------------------------------------------------ */
export function balances(s: AppState, creatorId: string) {
  let available = 0, pending = 0, earned = 0, spent = 0;
  s.ledger.filter((l) => l.creatorId === creatorId).forEach((l) => {
    if (l.type === "spent") {
      spent += l.points;
      available -= l.points;
    } else if (l.released) {
      available += l.points;
      earned += l.points;
    } else pending += l.points;
  });
  return { available, pending, earned, spent };
}

export const MARKETS: Market[] = ["UAE", "KSA"];
