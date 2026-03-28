"use server";

import { TMDBresultsEntity } from "./tmdb.types";
import { count } from "console";
import { createClient } from "@/lib/supabase/server";
import { toInt } from "radash";

const POSTLIMIT = toInt(process.env.NEXT_PUBLIC_POSTS_LIMIT);
const GRIDPOSTLIMIT = toInt(process.env.NEXT_PUBLIC_POSTS_GRID_LIMIT);

const TMDB_API_KEY = process.env.TMDB_API_KEY;

export async function fetchAllRecords({
  curentPage = 1,
  grid = false,
}: {
  curentPage?: number;
  grid?: boolean;
}) {
  const postLimit = grid ? GRIDPOSTLIMIT : POSTLIMIT;
  const supabase = await createClient();

  try {
    // await new Promise((resolve) => setTimeout(resolve, 3000)) //!DEV TEST
    const { data: posts, count } = await supabase
      .from("records")
      .select("*", { count: "exact" })
      .order("watchedat", { ascending: false })
      .range(postLimit * curentPage - postLimit, postLimit * curentPage - 1);

    return { posts, count: count || 0 };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch All Posts.");
  }
}

export async function searchRecords({
	searchQuery,
	curentPage = 1,
}: {
	searchQuery: string | undefined
	curentPage?: number
}) {
  const postLimit = POSTLIMIT;
  const supabase = await createClient();

  if (!searchQuery) {
    return { posts: undefined, count: 0 };
  }

  try {
    // await new Promise((resolve) => setTimeout(resolve, 3000)) //!DEV TEST
    const { data: posts, count } = await supabase
      .from("records")
      .select("*", { count: "exact" })
      .ilike("title", `%${searchQuery}%`)
      .order("watchedat", { ascending: false })
      .range(postLimit * curentPage - postLimit, postLimit * curentPage - 1);

    return { posts, count: count || 0 };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch Posts.");
  }
}

export async function fetchSortedAnimeRecords({
  curentPage = 1,
  grid = false,
}: {
  curentPage?: number;
  grid?: boolean;
}) {
  const postLimit = grid ? GRIDPOSTLIMIT : POSTLIMIT;
  const supabase = await createClient();

  try {
    // await new Promise((resolve) => setTimeout(resolve, 3000)) //!DEV TEST
    const { data: posts, count } = await supabase
      .from("records")
      .select("*", { count: "exact" })
      .not("sort_order_anime", "is", null)
      .order("sort_order_anime", { ascending: true })
      .range(postLimit * curentPage - postLimit, postLimit * curentPage - 1);

    return { posts, count: count || 0 };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch All Posts.");
  }
}

export async function fetchSortedMoviesRecords({
  curentPage = 1,
  grid = false,
}: {
  curentPage?: number;
  grid?: boolean;
}) {
  const postLimit = grid ? GRIDPOSTLIMIT : POSTLIMIT;
  const supabase = await createClient();

  try {
    // await new Promise((resolve) => setTimeout(resolve, 3000)) //!DEV TEST
    const { data: posts, count } = await supabase
      .from("records")
      .select("*", { count: "exact" })
      .not("sort_order_movie", "is", null)
      .order("sort_order_movie", { ascending: true })
      .range(postLimit * curentPage - postLimit, postLimit * curentPage - 1);

    return { posts, count: count || 0 };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch All Posts.");
  }
}

export async function fetchSortedSeriesRecords({
  curentPage = 1,
  grid = false,
}: {
  curentPage?: number;
  grid?: boolean;
}) {
  const postLimit = grid ? GRIDPOSTLIMIT : POSTLIMIT;
  const supabase = await createClient();

  try {
    // await new Promise((resolve) => setTimeout(resolve, 3000)) //!DEV TEST
    const { data: posts, count } = await supabase
      .from("records")
      .select("*", { count: "exact" })
      .not("sort_order_series", "is", null)
      .order("sort_order_series", { ascending: true })
      .range(postLimit * curentPage - postLimit, postLimit * curentPage - 1);

    return { posts, count: count || 0 };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch All Posts.");
  }
}

export async function fetchTmdbSearchResults({
  searchQuery,
}: {
  searchQuery: string;
}) {
  const tmdbApiUrl = `https://api.themoviedb.org/3/search/multi?language=en-US&api_key=${TMDB_API_KEY}&query=${searchQuery}`;

  try {
    const data = await fetch(tmdbApiUrl)
      .then((response) => response.json())
      .catch((error) => {
        return { status: error };
      });

    return data.results as TMDBresultsEntity[];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch Post Metadata.");
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

  try {
    const { data: record } = await supabase
      .from("records")
      .select("*")
      .eq("year", toInt(year))
      .eq("slug", `${slug}`)
      .limit(1)
      .single();
    return { record };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch Post.");
  }
}

export async function fetchRecordMetadata({
  mediatype,
  tmdbid,
}: {
  mediatype: string;
  tmdbid: number;
}) {
  if (!tmdbid) {
    throw new Error("Failed to fetch Post Metadata.");
  }

  mediatype = mediatype === "movie" ? "movie" : "tv";

  const tmdbApiUrl = `https://api.themoviedb.org/3/${mediatype}/${tmdbid}?api_key=${TMDB_API_KEY}`;

  try {
    const data = await fetch(tmdbApiUrl)
      .then((response) => response.json())
      .then((data) => {
        return {
          voteAvarage: data?.vote_average || "",
          runtime: data?.runtime || "",
          overview: data?.overview || "",
          imdbId: data?.imdb_id || "",
          seasons: data?.number_of_seasons || "",
          episodes: data?.number_of_episodes || "",
        };
      });

    return { data };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch Post Metadata.");
  }
}