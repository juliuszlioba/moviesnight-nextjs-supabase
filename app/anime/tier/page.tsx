import { TIERS, TIER_STYLES, isTier, type Tier } from "@/lib/tiers";
import { fetchAllAnimeTierRecords, type AnimeTierRecord } from "@/lib/records";

import Header from "../../header";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "Anime Tier List",
};

type RowKey = Tier | "unranked";

const ROWS: { key: RowKey; label: string; style: string }[] = [
  ...TIERS.map((tier) => ({
    key: tier,
    label: tier,
    style: TIER_STYLES[tier],
  })),
  { key: "unranked", label: "?", style: "bg-muted text-muted-foreground" },
];

export default async function AnimeTierPage() {
  const { posts } = await fetchAllAnimeTierRecords();

  // Posts arrive in anime sort order, so each group keeps that order
  const groups = new Map<RowKey, AnimeTierRecord[]>(
    ROWS.map((row) => [row.key, []]),
  );
  for (const post of posts) {
    groups.get(isTier(post.tier) ? post.tier : "unranked")!.push(post);
  }

  return (
    <div>
      <Header />
      <main className="flex flex-col space-y-4 mb-auto">
        <div className="flex items-baseline justify-between gap-4">
          <h1>Anime tier list</h1>
          <p className="text-sm text-muted-foreground">{posts.length} anime</p>
        </div>
        <TooltipProvider>
          <div className="flex flex-col gap-2">
            {ROWS.map(({ key, label, style }) => {
              const records = groups.get(key)!;
              if (key === "unranked" && records.length === 0) return null;

              return (
                <section
                  key={key}
                  aria-label={key === "unranked" ? "Unranked" : `${label} Tier`}
                  className="flex overflow-hidden rounded-lg bg-card/50"
                >
                  <div
                    className={cn(
                      "flex w-12 shrink-0 flex-col items-center justify-center gap-1 sm:w-20",
                      style,
                    )}
                  >
                    <span className="text-2xl font-bold sm:text-4xl">
                      {label}
                    </span>
                    <span className="text-xs opacity-80">{records.length}</span>
                  </div>
                  <div className="flex min-h-24 flex-1 flex-wrap content-start gap-1.5 p-1.5 sm:min-h-32 sm:gap-2 sm:p-2">
                    {records.map((record) => (
                      <TierPoster key={record.id} record={record} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </TooltipProvider>
      </main>
    </div>
  );
}

function TierPoster({ record }: { record: AnimeTierRecord }) {
  const title = `${record.title}${record.year ? ` (${record.year})` : ""}`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={`/${record.mediatype}/${record.year}/${record.slug}`}
          aria-label={title}
          className="block rounded-md transition-transform hover:scale-105 focus:ring-2 focus:ring-primary focus-visible:outline-none"
        >
          {record.poster ? (
            <Image
              src={`https://image.tmdb.org/t/p/w154${record.poster}`}
              alt={record.title || "poster"}
              width={154}
              height={231}
              className="h-[84px] w-14 rounded-md bg-muted object-cover sm:h-[120px] sm:w-20"
              unoptimized={true}
            />
          ) : (
            <div className="flex h-[84px] w-14 items-center justify-center rounded-md bg-muted p-1 text-center text-[10px] leading-tight text-muted-foreground sm:h-[120px] sm:w-20 sm:text-xs">
              {record.title}
            </div>
          )}
        </Link>
      </TooltipTrigger>
      <TooltipContent>
        {record.title}
        {record.year && (
          <span className="ml-1.5 text-muted-foreground">{record.year}</span>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
