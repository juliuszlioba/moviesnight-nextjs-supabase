// Server-only data helpers. Intentionally NOT "use server": that directive
// would expose every exported function as a public, callable endpoint.
import "server-only";

import { GRID_POSTS_LIMIT, POSTS_LIMIT } from "./config";

import { TMDBresultsEntity } from "./tmdb.types";
import { createClient } from "@/lib/supabase/server";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_METADATA_REVALIDATE = 60 * 60 * 24; // 1 day

type SortColumn = "sort_order_anime" | "sort_order_movie" | "sort_order_series";

function pageRange(curentPage: number, postLimit: number) {
  const page = Math.max(1, curentPage);
  return [postLimit * (page - 1), postLimit * page - 1] as const;
}

export async function fetchAllRecords({
  curentPage = 1,
  grid = false,
}: {
  curentPage?: number;
  grid?: boolean;
}) {
  const postLimit = grid ? GRID_POSTS_LIMIT : POSTS_LIMIT;
  const supabase = await createClient();

  const { data: posts, count, error } = await supabase
    .from("records")
    .select("*", { count: "exact" })
    .order("watchedat", { ascending: false })
    .range(...pageRange(curentPage, postLimit));

  if (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch All Posts.");
  }

  return { posts, count: count || 0 };
}

export async function searchRecords({
  searchQuery,
  curentPage = 1,
}: {
  searchQuery: string | undefined;
  curentPage?: number;
}) {
  if (!searchQuery) {
    return { posts: undefined, count: 0 };
  }

  const supabase = await createClient();
  // Escape LIKE wildcards so "%" and "_" are matched literally
  const escaped = searchQuery.replace(/[\\%_]/g, (c) => `\\${c}`);

  const { data: posts, count, error } = await supabase
    .from("records")
    .select("*", { count: "exact" })
    .ilike("title", `%${escaped}%`)
    .order("watchedat", { ascending: false })
    .range(...pageRange(curentPage, POSTS_LIMIT));

  if (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch Posts.");
  }

  return { posts, count: count || 0 };
}

async function fetchSortedRecords(
  column: SortColumn,
  { curentPage = 1, grid = false }: { curentPage?: number; grid?: boolean },
) {
  const postLimit = grid ? GRID_POSTS_LIMIT : POSTS_LIMIT;
  const supabase = await createClient();

  const { data: posts, count, error } = await supabase
    .from("records")
    .select("*", { count: "exact" })
    .not(column, "is", null)
    .order(column, { ascending: true })
    .range(...pageRange(curentPage, postLimit));

  if (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch sorted Posts.");
  }

  return { posts, count: count || 0 };
}

export async function fetchSortedAnimeRecords(opts: {
  curentPage?: number;
  grid?: boolean;
}) {
  return fetchSortedRecords("sort_order_anime", opts);
}

export async function fetchSortedMoviesRecords(opts: {
  curentPage?: number;
  grid?: boolean;
}) {
  return fetchSortedRecords("sort_order_movie", opts);
}

export async function fetchSortedSeriesRecords(opts: {
  curentPage?: number;
  grid?: boolean;
}) {
  return fetchSortedRecords("sort_order_series", opts);
}

export async function fetchTmdbSearchResults({
  searchQuery,
}: {
  searchQuery: string;
}): Promise<TMDBresultsEntity[] | null> {
  const url = new URL("https://api.themoviedb.org/3/search/multi");
  url.searchParams.set("language", "en-US");
  url.searchParams.set("api_key", TMDB_API_KEY ?? "");
  url.searchParams.set("query", searchQuery);

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      console.error("TMDB search failed:", response.status);
      return null;
    }
    const data = await response.json();
    return (data?.results as TMDBresultsEntity[]) ?? [];
  } catch (error) {
    console.error("TMDB search failed:", error);
    return null;
  }
}

export async function readRecord({
  slug,
  year,
}: {
  slug: string;
  year: number;
}) {
  const supabase = await createClient();

  const { data: record, error } = await supabase
    .from("records")
    .select("*")
    .eq("year", year)
    .eq("slug", slug)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch Post.");
  }

  return { record };
}

export type RecordMetadata = {
  voteAvarage: number | "";
  runtime: number | "";
  overview: string;
  imdbId: string;
  seasons: number | "";
  episodes: number | "";
};

/**
 * Fetch extra details from TMDB. Returns `null` instead of throwing so the
 * record page still renders when TMDB is down or the record has no tmdbid.
 * Responses are cached for a day.
 */
export async function fetchRecordMetadata({
  mediatype,
  tmdbid,
}: {
  mediatype: string;
  tmdbid: number | null;
}): Promise<{ data: RecordMetadata | null }> {
  if (!tmdbid) {
    return { data: null };
  }

  const tmdbType = mediatype === "movie" ? "movie" : "tv";
  const url = `https://api.themoviedb.org/3/${tmdbType}/${tmdbid}?api_key=${TMDB_API_KEY}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: TMDB_METADATA_REVALIDATE },
    });
    if (!response.ok) {
      console.error("TMDB metadata failed:", response.status);
      return { data: null };
    }
    const data = await response.json();
    return {
      data: {
        voteAvarage: data?.vote_average || "",
        runtime: data?.runtime || "",
        overview: data?.overview || "",
        imdbId: data?.imdb_id || "",
        seasons: data?.number_of_seasons || "",
        episodes: data?.number_of_episodes || "",
      },
    };
  } catch (error) {
    console.error("TMDB metadata failed:", error);
    return { data: null };
  }
}
