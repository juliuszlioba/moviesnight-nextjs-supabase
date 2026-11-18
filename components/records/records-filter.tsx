import { Clapperboard, Heart, LayoutList, Tv } from "lucide-react";
import { RECORD_FILTERS, type RecordFilter } from "@/lib/config";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fetchRecordCounts } from "@/lib/records";

const FILTER_META: Record<
  RecordFilter,
  { label: string; icon: typeof Clapperboard }
> = {
  all: { label: "All", icon: LayoutList },
  movies: { label: "Movies", icon: Clapperboard },
  series: { label: "Series", icon: Tv },
  anime: { label: "Anime", icon: Heart },
};

export function filterHref(filter: RecordFilter) {
  return filter === "all" ? "/" : `/?type=${filter}`;
}

export function RecordsFilterTabs({
  active,
  counts,
}: {
  active: RecordFilter;
  counts?: Record<RecordFilter, number>;
}) {
  return (
    <nav
      aria-label="Filter records"
      className="grid shrink-0 grid-cols-4 gap-2 sm:flex"
    >
      {RECORD_FILTERS.map((filter) => {
        const { label, icon: Icon } = FILTER_META[filter];
        const isActive = filter === active;
        return (
          <Link
            key={filter}
            href={filterHref(filter)}
            aria-current={isActive ? "page" : undefined}
            scroll={false}
            className={cn(
              buttonVariants({
                variant: isActive ? "default" : "outline",
                size: "sm",
              }),
              "max-sm:px-2",
            )}
          >
            <Icon strokeWidth={1.5} className="max-sm:hidden" />
            <span className="flex items-baseline gap-1">
              {label}
              {counts && (
                <span
                  className={cn(
                    "tabular-nums text-xs font-normal max-sm:hidden",
                    isActive ? "opacity-70" : "text-muted-foreground",
                  )}
                >
                  {counts[filter]}
                </span>
              )}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

/** Filter tabs with per-filter record counts. */
export default async function RecordsFilter({
  active,
}: {
  active: RecordFilter;
}) {
  const counts = await fetchRecordCounts();
  return <RecordsFilterTabs active={active} counts={counts} />;
}
