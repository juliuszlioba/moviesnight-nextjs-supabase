export const TIERS = ["S", "A", "B", "C", "D", "F"] as const;
export type Tier = (typeof TIERS)[number];

export function isTier(value: unknown): value is Tier {
  return typeof value === "string" && (TIERS as readonly string[]).includes(value);
}

// Suggested tier for a 1-10 rating; null for no rating
export function tierForRating(rating: number): Tier | null {
  if (rating >= 10) return "S";
  if (rating >= 8) return "A";
  if (rating === 7) return "B";
  if (rating === 6) return "C";
  if (rating >= 4) return "D";
  if (rating >= 1) return "F";
  return null;
}

// Full class strings so Tailwind can detect them
export const TIER_STYLES: Record<Tier, string> = {
  S: "bg-red-500 text-white shadow-red-500/50",
  A: "bg-orange-500 text-white shadow-orange-500/50",
  B: "bg-yellow-400 text-neutral-900 shadow-yellow-400/50",
  C: "bg-green-600 text-white shadow-green-600/50",
  D: "bg-blue-500 text-white shadow-blue-500/50",
  F: "bg-purple-600 text-white shadow-purple-600/50",
};
