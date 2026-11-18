import { TIERS, TIER_STYLES, isTier, type Tier } from "@/lib/tiers";
import { fetchAllAnimeTierRecords, type AnimeTierRecord } from "@/lib/records";

import Header from "../../header";
import { MessageCircle } from "lucide-react";
import { StarRating } from "@/components/StarRating";
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
          <div className="flex flex-col gap-6 sm:gap-8">
            {ROWS.map(({ key, label, style }) => {
              const records = groups.get(key)!;
              if (key === "unranked" && records.length === 0) return null;

              return (
                <section
                  key={key}
                  aria-label={key === "unranked" ? "Unranked" : `${label} Tier`}
                  className="flex gap-3 sm:gap-6"
                >
                  <div
                    className={cn(
                      "w-14 shrink-0 rounded-2xl shadow-lg sm:w-20",
                      style,
                    )}
                  >
                    <div className="sticky top-4 flex flex-col items-center gap-1 py-4 sm:py-6">
                      <span className="text-3xl leading-none font-bold sm:text-5xl">
                        {label}
                      </span>
                      <span className="text-[10px] font-semibold tracking-widest uppercase opacity-90 sm:text-sm">
                        {key === "unranked" ? "None" : "Tier"}
                      </span>
                      <span className="my-1 h-px w-6 bg-current opacity-60 sm:w-10" />
                      <span className="text-sm tabular-nums opacity-90">
                        {records.length}
                      </span>
                    </div>
                  </div>
                  {records.length > 0 ? (
                    <div className="grid min-w-0 flex-1 grid-cols-2 content-start gap-x-3 gap-y-5 sm:grid-cols-4 sm:gap-x-4 sm:gap-y-6 lg:grid-cols-5">
                      {records.map((record) => (
                        <TierCard key={record.id} record={record} />
                      ))}
                    </div>
                  ) : (
                    <p className="flex min-h-32 flex-1 items-center justify-center rounded-2xl border border-dashed text-sm text-muted-foreground">
                      Nothing here yet
                    </p>
                  )}
                </section>
              );
            })}
          </div>
        </TooltipProvider>
      </main>
    </div>
  );
}

function TierCard({ record }: { record: AnimeTierRecord }) {
  const title = `${record.title}${record.year ? ` (${record.year})` : ""}`;
  const comment = record.recommendation || (record.review ? "Has review" : "");

  return (
    <div className="flex flex-col gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={`/${record.mediatype}/${record.year}/${record.slug}`}
            aria-label={title}
            className="block overflow-hidden rounded-lg bg-muted transition-transform hover:scale-[1.03] focus:ring-2 focus:ring-primary focus-visible:outline-none"
          >
            {record.poster ? (
              <Image
                src={`https://image.tmdb.org/t/p/w342${record.poster}`}
                alt={record.title || "poster"}
                width={342}
                height={513}
                className="aspect-2/3 h-auto w-full object-cover"
                unoptimized={true}
              />
            ) : (
              <div className="flex aspect-2/3 w-full items-center justify-center p-2 text-center text-sm text-muted-foreground">
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
      <div className="flex items-center justify-between gap-2 px-0.5">
        <div className="[&_svg]:size-3.5 sm:[&_svg]:size-4 [&>div]:gap-0.5">
          <StarRating rating={record.rating || 0} />
        </div>
        {comment && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                tabIndex={0}
                aria-label={comment}
                className="rounded-sm text-muted-foreground focus:ring-2 focus:ring-primary focus-visible:outline-none"
              >
                <MessageCircle
                  strokeWidth={2}
                  className={cn("size-4", record.review && "fill-current")}
                />
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-64 py-2">
              {record.recommendation ? (
                <p className="quate text-yellow-400">
                  {record.recommendation}
                </p>
              ) : (
                comment
              )}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
