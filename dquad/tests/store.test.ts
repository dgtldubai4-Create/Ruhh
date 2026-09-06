import { beforeEach, describe, expect, it } from "vitest";
import { store } from "@/lib/store/store";
import { createSeedState, DEMO_CREATOR_ID } from "@/lib/store/seed";
import { balances, redeemReward, releasePoints, respondToInvitation, publishContent, reviewSubmission, uploadSubmission, verifyPublication, resetDemo, submitQuest, joinQuest, advanceShipment } from "@/lib/store/actions";

beforeEach(() => {
  store.__replace(createSeedState());
});

describe("invitations", () => {
  it("are never automatic and only pending invitations can change", () => {
    const c = store.get().campaigns.find((x) => x.id === "c_vatika_reset")!;
    expect(c.invitations.find((i) => i.creatorId === DEMO_CREATOR_ID)?.status).toBe("pending");
    respondToInvitation("c_vatika_reset", DEMO_CREATOR_ID, "declined");
    expect(store.get().campaigns.find((x) => x.id === "c_vatika_reset")!.invitations.find((i) => i.creatorId === DEMO_CREATOR_ID)?.status).toBe("declined");
    respondToInvitation("c_vatika_reset", DEMO_CREATOR_ID, "accepted");
    expect(store.get().campaigns.find((x) => x.id === "c_vatika_reset")!.invitations.find((i) => i.creatorId === DEMO_CREATOR_ID)?.status).toBe("declined");
  });
  it("accepting queues a product kit and notifies both sides", () => {
    const before = store.get().shipments.length;
    respondToInvitation("c_herbl_smile", DEMO_CREATOR_ID, "accepted");
    const s = store.get();
    expect(s.shipments.length).toBe(before + 1);
    expect(s.shipments[0].kind).toBe("product_kit");
    expect(s.notifications.some((n) => n.audience === "creator" && n.title.includes("You are in"))).toBe(true);
    expect(s.notifications.some((n) => n.audience === "admin" && n.title.includes("accepted"))).toBe(true);
  });
});

describe("campaign journey and points ledger", () => {
  it("upload, approve, publish, verify, release moves points from pending to available", () => {
    const start = balances(store.get(), DEMO_CREATOR_ID);
    const sub = uploadSubmission("c_amla_roots", DEMO_CREATOR_ID, "amla-final-cut.mp4", 51_000_000)!;
    expect(sub.version).toBe(2);
    expect(sub.status).toBe("in_review");
    reviewSubmission(sub.id, "Reem Al Awadhi", "approved");
    let s = store.get();
    expect(s.submissions.find((x) => x.id === sub.id)!.status).toBe("approved");
    expect(balances(s, DEMO_CREATOR_ID).pending).toBe(start.pending + 1200);
    publishContent("c_amla_roots", DEMO_CREATOR_ID, "instagram", "https://www.instagram.com/reel/test");
    s = store.get();
    const pub = s.publications.find((p) => p.campaignId === "c_amla_roots" && p.creatorId === DEMO_CREATOR_ID)!;
    expect(pub.verification).toBe("pending");
    releasePoints(pub.id, "Finance");
    expect(store.get().publications.find((p) => p.id === pub.id)!.pointsReleased).toBe(false);
    verifyPublication(pub.id, "Finance");
    releasePoints(pub.id, "Finance");
    s = store.get();
    expect(s.publications.find((p) => p.id === pub.id)!.pointsReleased).toBe(true);
    const end = balances(s, DEMO_CREATOR_ID);
    expect(end.available).toBe(start.available + 1200);
    expect(end.pending).toBe(start.pending);
  });
  it("unlimited revisions keep incrementing versions with deterministic scores", () => {
    const a = uploadSubmission("c_amla_roots", DEMO_CREATOR_ID, "take-two.mp4", 1)!;
    const b = uploadSubmission("c_amla_roots", DEMO_CREATOR_ID, "take-two.mp4", 1)!;
    expect(b.version).toBe(a.version + 1);
    expect(b.score).toBe(a.score);
  });
});

describe("rewards", () => {
  it("redemption spends points, decrements stock and creates a shipment", () => {
    const before = balances(store.get(), DEMO_CREATOR_ID);
    const res = redeemReward("rw_vatika_kit", DEMO_CREATOR_ID, "Villa 12, Dubai");
    expect(res.ok).toBe(true);
    const s = store.get();
    expect(balances(s, DEMO_CREATOR_ID).available).toBe(before.available - 600);
    expect(s.rewards.find((r) => r.id === "rw_vatika_kit")!.stock).toBe(8);
    expect(s.shipments[0].kind).toBe("reward");
    expect(s.redemptions[0].rewardId).toBe("rw_vatika_kit");
  });
  it("refuses out of stock and insufficient balances", () => {
    expect(redeemReward("rw_dermoviva_set", DEMO_CREATOR_ID, "x").reason).toBe("out_of_stock");
    expect(redeemReward("rw_ring_light", DEMO_CREATOR_ID, "x").reason).toBe("insufficient");
  });
  it("shipments advance through the five logistics states", () => {
    advanceShipment("sh_amla_kit", "Logistics");
    expect(store.get().shipments.find((x) => x.id === "sh_amla_kit")!.status).toBe("out_for_delivery");
    advanceShipment("sh_amla_kit", "Logistics");
    advanceShipment("sh_amla_kit", "Logistics");
    expect(store.get().shipments.find((x) => x.id === "sh_amla_kit")!.status).toBe("delivered");
  });
});

describe("quests", () => {
  it("question quests complete instantly and release points", () => {
    joinQuest("q_amla_know", "cr_omar");
    const before = balances(store.get(), "cr_omar").available;
    submitQuest("q_amla_know", "cr_omar", "Indian gooseberry", undefined, 0);
    expect(balances(store.get(), "cr_omar").available).toBe(before + 150);
  });
});

describe("reset", () => {
  it("restores the seed exactly", () => {
    respondToInvitation("c_vatika_reset", DEMO_CREATOR_ID, "accepted");
    resetDemo();
    expect(store.get()).toEqual(createSeedState());
  });
});
