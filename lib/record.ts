"use server";

import { TMDBresultsEntity } from "./tmdb.types";
import { createClient } from "./supabase/server";
import { revalidatePath } from "next/cache";
import slugify from "./slugify";
import { toInt } from "radash";

export interface Status {
  status: "success" | "duplicate" | "error" | "unauthorised";
  message?: string | unknown;
  redirectTo?: string;
}

const TMDB_API_KEY = process.env.TMDB_API_KEY;

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

export async function addRecord({
  record,
}: {
  record: TMDBresultsEntity;
}): Promise<Status> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!record) {
    return { status: "error" };
  }

  if (!user) {
    return { status: "unauthorised" };
  }

  function preocessData(record: TMDBresultsEntity) {
    const year =
      record.release_date?.substring(0, 4) ||
      record.first_air_date?.substring(0, 4) ||
      "0";

    const media_type = record.media_type === "tv" ? "series" : "movie";

    return {
      tmdbid: record.id,
      mediatype: media_type,
      poster: record.poster_path || "",
      title: (record.title as string) || (record.name as string),
      year: parseInt(year),
      slug: slugify((record.title as string) || (record.name as string)),
      recommendation: "",
      review: "",
      rating: 0,
    };
  }

  const handleGenres = (genresIndexes: number[], recordId: number) => {
    genresIndexes.map(async (genreIndex: number) => {
      await supabase
        .from("records_ganres")
        .insert({ record_id: recordId, ganre_id: genreIndex });
    });
    return;
  };

  try {
    if (!record.title && !record.name) {
      return { status: "error" };
    }

    const preslug = record.title || record.name || "";

    if (!preslug || preslug.length === 0) {
      return { status: "error" };
    }

    // 0: Prepare data
    const slug = slugify(preslug);
    const year =
      record.release_date?.substring(0, 4) ||
      record.first_air_date?.substring(0, 4);

    if (!slug || !year) {
      return { status: "error" };
    }

    // 1: check for existing record
    const { count, error } = await supabase
      .from("records")
      .select("*", { count: "exact" })
      .eq("slug", slug)
      .eq("year", toInt(year));

    if (count === null || error || count > 0) {
      return { status: "duplicate" };
    }

    // 2: process record data
    const dataLoad = preocessData(record);

    // 3: Insert to database
    const { data: returndata, error: resError } = await supabase
      .from("records")
      .insert(dataLoad)
      .select()
      .single();

    if (resError) {
      throw new Error("error");
    }

    // 4: Handle ganres
    if (record.genre_ids) {
      handleGenres(record.genre_ids, returndata.id);
    }

    revalidatePath("/[mediatype]/[year]/[slug]", "page");
    revalidatePath("/", "page");

    return {
      status: "success",
      redirectTo: `/${dataLoad.mediatype}/${dataLoad.year}/${dataLoad.slug}`,
    };
  } catch (error) {
    console.log("Database Error ", error);
    return { status: "error" };
  }
}
