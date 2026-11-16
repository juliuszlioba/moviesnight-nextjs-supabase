import { TIER_STYLES, isTier } from "@/lib/tiers";

import { cn } from "@/lib/utils";

/** Tilted tier sticker, meant to sit in the top-left corner of a poster. */
export function TierBadge({
  tier,
  className,
}: {
  tier: string | null | undefined;
  className?: string;
}) {
  if (!isTier(tier)) return null;

  return (
    <div className={cn("absolute top-3 -left-2 -rotate-6", className)}>
      <span
        className={cn(
          "block rounded-md px-3 py-1 font-bold shadow-lg",
          TIER_STYLES[tier],
        )}
        title={`${tier} Tier`}
      >
        {tier}
      </span>
    </div>
  );
}
