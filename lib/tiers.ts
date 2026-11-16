export const TIERS = ["S", "A", "B", "C", "D", "F"] as const;
export type Tier = (typeof TIERS)[number];

export function isTier(value: unknown): value is Tier {
  return typeof value === "string" && (TIERS as readonly string[]).includes(value);
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
