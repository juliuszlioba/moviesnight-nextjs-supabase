import { toInt } from "radash";

// Fallbacks protect against a missing/invalid env var (would otherwise be 0
// and break pagination math and range queries).
export const POSTS_LIMIT = Math.max(
  1,
  toInt(process.env.NEXT_PUBLIC_POSTS_LIMIT, 20),
);
export const GRID_POSTS_LIMIT = Math.max(
  1,
  toInt(process.env.NEXT_PUBLIC_POSTS_GRID_LIMIT, 40),
);

// Timezone used to display watch dates. The server (Vercel) runs in UTC, while
// dates are picked in the browser at local midnight.
export const DISPLAY_TIMEZONE = "Europe/Vienna";

/** Parse a `?page=` value into a positive integer page number. */
export function parsePage(page: string | undefined): number {
  const n = Math.floor(Number(page));
  return Number.isFinite(n) && n > 0 ? n : 1;
}

/** Format a timestamp as yyyy-MM-dd in DISPLAY_TIMEZONE. */
export function formatDisplayDate(value: string | Date): string {
  // en-CA locale formats dates as yyyy-MM-dd
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: DISPLAY_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

/** Home page filters. Anime = any record with a sort_order_anime value. */
export const RECORD_FILTERS = ["all", "movies", "series", "anime"] as const;
export type RecordFilter = (typeof RECORD_FILTERS)[number];

/** Parse a `?type=` value into a RecordFilter (defaults to "all"). */
export function parseRecordFilter(value: string | undefined): RecordFilter {
  return RECORD_FILTERS.includes(value as RecordFilter)
    ? (value as RecordFilter)
    : "all";
}
