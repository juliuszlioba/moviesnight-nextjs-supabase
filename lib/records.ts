"use server";

import { TMDBresultsEntity } from "./tmdb.types";
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