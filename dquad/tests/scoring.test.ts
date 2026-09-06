import { describe, expect, it } from "vitest";
import { CRITERIA, hashString, matchScore, scoreSubmission } from "@/lib/store/scoring";

describe("simulated scoring", () => {
  it("is deterministic for the same file name", () => {
    const a = scoreSubmission("amla-week1-ritual-v1.mp4");
    const b = scoreSubmission("amla-week1-ritual-v1.mp4");
    expect(a).toEqual(b);
  });
  it("ignores case and surrounding whitespace", () => {
    expect(scoreSubmission("  Honey.MP4 ").score).toBe(scoreSubmission("honey.mp4").score);
  });
  it("differs between different files", () => {
    expect(scoreSubmission("a.mp4").score === scoreSubmission("b.mp4").score && scoreSubmission("a.mp4").breakdown[0].score === scoreSubmission("b.mp4").breakdown[0].score).toBe(false);
  });
  it("weights sum to 100 and scores stay within 55..98", () => {
    expect(CRITERIA.reduce((a, c) => a + c.weight, 0)).toBe(100);
    for (const name of ["x.mp4", "winter-spoon-v2.mp4", "rania-amla-cut-a.mov", "noor-sunday-cut1.mp4"]) {
      const r = scoreSubmission(name);
      expect(r.score).toBeGreaterThanOrEqual(55);
      expect(r.score).toBeLessThanOrEqual(98);
      r.breakdown.forEach((b) => expect(b.note.length).toBeGreaterThan(0));
    }
  });
  it("hash is stable", () => {
    expect(hashString("dquad")).toBe(hashString("dquad"));
  });
  it("match score rewards market and niche overlap", () => {
    const base = { creatorNiches: ["Haircare"], brandCategory: "Haircare", followers: 80_000, verified: true, seed: "x" };
    const inMarket = matchScore({ ...base, creatorMarket: "UAE", campaignMarkets: ["UAE"] });
    const outMarket = matchScore({ ...base, creatorMarket: "KSA", campaignMarkets: ["UAE"] });
    expect(inMarket).toBeGreaterThan(outMarket);
    expect(inMarket).toBeLessThanOrEqual(99);
  });
});
