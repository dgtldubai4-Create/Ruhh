import type { Criterion, ScoreBreakdown } from "./types";

/** Five prototype criteria. Weights sum to 100. Guidance only, no minimum score. */
export const CRITERIA: Criterion[] = [
  { id: "hook", label: "Hook in the first 3 seconds", weight: 25, guidance: "Open on a face, a question or the product in motion." },
  { id: "product", label: "Product clarity", weight: 25, guidance: "Show the pack clearly at least once, with the name readable." },
  { id: "fit", label: "Brand fit", weight: 20, guidance: "Keep the tone warm and everyday, matching the brief." },
  { id: "story", label: "Storytelling", weight: 15, guidance: "A beginning, a moment of change, and a payoff." },
  { id: "audio", label: "Audio and captions", weight: 15, guidance: "Clean voice, music under speech, captions on." },
];

/** FNV-1a 32-bit hash. Same file name always yields the same score. */
export function hashString(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

const NOTES: Record<string, [string, string, string]> = {
  hook: ["The opening is slow; try starting mid-action.", "Good opening, tighten the first second.", "Strong hook, the first frame does the work."],
  product: ["The pack is hard to read; hold it closer and longer.", "Pack is visible; add one clean close-up.", "Pack is clear and readable throughout."],
  fit: ["Tone feels a little salesy for this brief.", "Tone is close; soften the call to action.", "Tone fits the brief nicely."],
  story: ["It reads as a list; give it a small arc.", "There is an arc; land the payoff sooner.", "Clear arc with a satisfying payoff."],
  audio: ["Music is louder than your voice in places.", "Audio is fine; captions would help.", "Voice, music and captions are balanced."],
};

export function scoreSubmission(fileName: string, criteria: Criterion[] = CRITERIA): { score: number; breakdown: ScoreBreakdown } {
  const base = hashString(fileName.trim().toLowerCase());
  let weighted = 0;
  const breakdown: ScoreBreakdown = criteria.map((c, i) => {
    const slice = (base >>> (i * 6)) & 0x3f; // 0..63
    const score = 55 + Math.round((slice / 63) * 43); // 55..98
    weighted += (score * c.weight) / 100;
    const band = score < 70 ? 0 : score < 85 ? 1 : 2;
    return { criterionId: c.id, score, note: NOTES[c.id]?.[band] ?? "" };
  });
  return { score: Math.round(weighted), breakdown };
}

/** Deterministic creator match score for a campaign, 40..99. */
export function matchScore(input: {
  creatorMarket: string;
  campaignMarkets: string[];
  creatorNiches: string[];
  brandCategory: string;
  followers: number;
  verified: boolean;
  seed: string;
}): number {
  let score = 40;
  if (input.campaignMarkets.includes(input.creatorMarket)) score += 22;
  const cat = input.brandCategory.toLowerCase();
  if (input.creatorNiches.some((n) => cat.includes(n.toLowerCase()) || n.toLowerCase().includes(cat.split(" ")[0]))) score += 18;
  if (input.followers > 50_000) score += 8;
  if (input.followers > 200_000) score += 4;
  if (input.verified) score += 5;
  score += hashString(input.seed) % 6;
  return Math.min(99, score);
}
