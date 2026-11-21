"use server";

import {
  RecordEditFormSchema,
  type RecordEditFormValues,
  SortListType,
} from "./schemas";

import { type AnilistMedia, searchAnilistAnime } from "./anilist";
import { TMDBresultsEntity } from "./tmdb.types";
import { createClient } from "./supabase/server";
import {
  type TmdbSyncResult,
  markTmdbWatched,
  syncTmdbRating,
} from "./tmdb-account";
import { revalidatePath } from "next/cache";
import slugify from "./slugify";

export interface Status {
  status: "success" | "duplicate" | "error" | "unauthorised";
  message?: string;
  redirectTo?: string;
  /** Set when the record saved but syncing to the TMDB account failed. */
  warning?: string;
}

/** Warning for the UI, or undefined when every TMDB sync went fine. */
function tmdbSyncWarning(results: TmdbSyncResult[]): string | undefined {
  if (results.includes("unauthorized")) {
    return "Saved, but the TMDB session expired. Run `pnpm tmdb:session` and update TMDB_SESSION_ID.";
  }
  if (results.includes("failed")) {
    return "Saved, but syncing to TMDB failed.";
  }
  return undefined;
}

// Postgres unique_violation
const UNIQUE_VIOLATION = "23505";

async function getAuthedClient() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return { supabase, user: data?.claims ?? null };
}

function revalidateRecordPages() {
  revalidatePath("/", "layout");
}

// RECORDS > ADD
export async function addRecord({
  record,
}: {
  record: TMDBresultsEntity;
}): Promise<Status> {
  const { supabase, user } = await getAuthedClient();

  if (!user) {
    return { status: "unauthorised" };
  }

  if (
    !record ||
    !Number.isInteger(record.id) ||
    (record.media_type !== "movie" && record.media_type !== "tv")
  ) {
    return { status: "error", message: "Invalid record." };
  }

  const title = record.title || record.name || "";
  const slug = slugify(title);
  const year = parseInt(
    record.release_date?.substring(0, 4) ||
      record.first_air_date?.substring(0, 4) ||
      "",
    10,
  );

  if (!title || !slug || !Number.isInteger(year)) {
    return { status: "error", message: "Missing title or release year." };
  }

  try {
    // 1: check for existing record
    const { count, error } = await supabase
      .from("records")
      .select("id", { count: "exact", head: true })
      .eq("slug", slug)
      .eq("year", year);

    if (error) {
      throw error;
    }
    if (count && count > 0) {
      return { status: "duplicate" };
    }

    // 2: Insert to database
    const dataLoad = {
      tmdbid: record.id,
      mediatype: record.media_type === "tv" ? "series" : "movie",
      poster: record.poster_path || "",
      title,
      year,
      slug,
      recommendation: "",
      review: "",
      rating: 0,
    };

    const { error: insertError } = await supabase
      .from("records")
      .insert(dataLoad);

    if (insertError) {
      // Unique index on (year, slug) catches races with the check above
      if (insertError.code === UNIQUE_VIOLATION) {
        return { status: "duplicate" };
      }
      throw insertError;
    }

    revalidateRecordPages();

    const tmdbSync = await markTmdbWatched({
      mediatype: dataLoad.mediatype,
      tmdbid: dataLoad.tmdbid,
    });

    return {
      status: "success",
      redirectTo: `/${dataLoad.mediatype}/${dataLoad.year}/${dataLoad.slug}`,
      warning: tmdbSyncWarning([tmdbSync]),
    };
  } catch (error) {
    console.error("Database Error. ", error);
    return { status: "error" };
  }
}

// RECORDS > UPDATE
export async function updateRecord({
  formValues,
}: {
  formValues: RecordEditFormValues;
}): Promise<Status> {
  const { supabase, user } = await getAuthedClient();

  if (!user) {
    return { status: "unauthorised" };
  }

  const parsed = RecordEditFormSchema.safeParse(formValues);
  if (!parsed.success) {
    return { status: "error", message: "Invalid form values." };
  }
  const values = parsed.data;

  try {
    // Previous TMDB id, so a changed id doesn't leave a stale TMDB rating
    const { data: previous } = await supabase
      .from("records")
      .select("tmdbid")
      .eq("id", values.id)
      .maybeSingle();

    const { data, error } = await supabase
      .from("records")
      .update({
        title: values.title,
        slug: values.slug,
        tmdbid: values.tmdbid === "" ? null : Number(values.tmdbid),
        anilistid: values.anilistid === "" ? null : Number(values.anilistid),
        rating: Number(values.rating),
        tier: values.tier === "none" ? null : values.tier,
        recommendation: values.recommendation,
        review: values.review,
        watchedat: values.watchedAt.toISOString(),
        updatedat: new Date().toISOString(),
      })
      .eq("id", values.id)
      .select("mediatype, year, slug, tmdbid, rating")
      .single();

    if (error) {
      // Unique index on (year, slug)
      if (error.code === UNIQUE_VIOLATION) {
        return {
          status: "duplicate",
          message: "Another record already uses this slug for that year.",
        };
      }
      throw error;
    }

    revalidateRecordPages();

    const syncs = [
      syncTmdbRating({
        mediatype: data.mediatype,
        tmdbid: data.tmdbid,
        rating: data.rating ?? 0,
      }),
    ];
    if (previous?.tmdbid && previous.tmdbid !== data.tmdbid) {
      syncs.push(
        syncTmdbRating({
          mediatype: data.mediatype,
          tmdbid: previous.tmdbid,
          rating: 0,
        }),
      );
    }
    const results = await Promise.all(syncs);

    return {
      status: "success",
      redirectTo: `/${data.mediatype}/${data.year}/${data.slug}`,
      warning: tmdbSyncWarning(results),
    };
  } catch (error) {
    console.error("Database Error. ", error);
    return { status: "error" };
  }
}

// ANILIST > SEARCH : Find anime to link a record to
export async function searchAnilist({
  query,
}: {
  query: string;
}): Promise<
  | { status: "success"; results: AnilistMedia[] }
  | { status: "error" | "unauthorised"; message?: string }
> {
  const { user } = await getAuthedClient();

  if (!user) {
    return { status: "unauthorised" };
  }

  const search = typeof query === "string" ? query.trim() : "";
  if (!search || search.length > 200) {
    return { status: "error", message: "Enter a title to search." };
  }

  const results = await searchAnilistAnime(search);
  if (!results) {
    return { status: "error", message: "AniList search failed." };
  }
  return { status: "success", results };
}

// RECORDS > DELETE
export async function deleteRecord({ id }: { id: number }): Promise<Status> {
  const { supabase, user } = await getAuthedClient();

  if (!user) {
    return { status: "unauthorised" };
  }

  if (!Number.isInteger(id)) {
    return { status: "error" };
  }

  try {
    const { error } = await supabase.from("records").delete().eq("id", id);

    if (error) {
      throw error;
    }

    revalidateRecordPages();

    return { status: "success" };
  } catch (error) {
    console.error("Database Error: ", error);
    return { status: "error" };
  }
}

// SORTLIST > shared runner for the sort-order RPCs
async function runSortRpc(
  rpc: "add_to_sort" | "remove_from_sort" | "update_single_sort_order",
  args: { mediaType: string; recordId: number; newPosition?: number },
): Promise<Status> {
  const { supabase, user } = await getAuthedClient();

  if (!user) {
    return { status: "unauthorised" };
  }

  const mediaType = SortListType.safeParse(args.mediaType);
  if (
    !mediaType.success ||
    !Number.isInteger(args.recordId) ||
    (rpc === "update_single_sort_order" &&
      !(Number.isInteger(args.newPosition) && args.newPosition! >= 1))
  ) {
    return { status: "error", message: "Invalid input." };
  }

  try {
    const { error } =
      rpc === "update_single_sort_order"
        ? await supabase.rpc(rpc, {
            media_type: mediaType.data,
            record_id: args.recordId,
            new_position: args.newPosition!,
          })
        : await supabase.rpc(rpc, {
            media_type: mediaType.data,
            record_id: args.recordId,
          });

    if (error) {
      console.error(`Error in ${rpc}:`, error);
      return { status: "error" };
    }

    revalidateRecordPages();

    return { status: "success" };
  } catch (error) {
    console.error("Database Error: ", error);
    return { status: "error" };
  }
}

// SORTLIST > ADD : Append a record to the bottom of the sorted list
export async function addRecordToSortOrder({
  mediaType,
  recordId,
}: {
  mediaType: string;
  recordId: number;
}): Promise<Status> {
  return runSortRpc("add_to_sort", { mediaType, recordId });
}

// SORTLIST > UPDATE SINGLE : Move one record to a new position
export async function moveSingleRecordSortOrder({
  mediaType,
  recordId,
  newPosition,
}: {
  mediaType: string;
  recordId: number;
  newPosition: number;
}): Promise<Status> {
  return runSortRpc("update_single_sort_order", {
    mediaType,
    recordId,
    newPosition,
  });
}

// SORTLIST > REMOVE : Take a record out of the sorted list
export async function removeRecordFromSortOrder({
  mediaType,
  recordId,
}: {
  mediaType: string;
  recordId: number;
}): Promise<Status> {
  return runSortRpc("remove_from_sort", { mediaType, recordId });
}
