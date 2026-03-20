"use server";

import * as z from "zod";

import { RecordEditFormSchema } from "@/components/records/record-edit";
import { TMDBresultsEntity } from "./tmdb.types";
import { createClient } from "./supabase/server";
import { formatISO } from "date-fns";
import { revalidatePath } from "next/cache";
import slugify from "./slugify";
import { toInt } from "radash";

export interface Status {
  status: "success" | "duplicate" | "error" | "unauthorised";
  message?: string | unknown;
  redirectTo?: string;
}

// RECORDS > ADD
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
    console.log("Database Error. ", error);
    return { status: "error" };
  }
}

// RECORDS > UPDATE
export async function updateRecord({
  formValues,
}: {
  formValues: z.infer<typeof RecordEditFormSchema>;
}): Promise<Status> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "unauthorised" };
  }

  try {
    //await new Promise((resolve) => setTimeout(resolve, 3000)) //!
    const { error: supabaseError } = await supabase
      .from("records")
      .update({
        rating: toInt(formValues.rating),
        recommendation: formValues.recommendation,
        review: formValues.review,
        watchedat: formatISO(new Date(formValues.watchedAt)),
        updatedat: formatISO(new Date()),
      })
      .eq("id", formValues.id)
      .select()
      .single();
    if (supabaseError) {
      throw new Error("error");
    }

    revalidatePath("/[mediatype]/[year]/[slug]", "page");
    revalidatePath("/", "page");

    return { status: "success" };
  } catch (error) {
    console.log("Database Error. ", error);
    return { status: "error" };
  }
}

// RECORDS > DELETE
export async function deleteRecord({ id }: { id: number }): Promise<Status> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "unauthorised" };
  }

  try {
    const { error: supabaseError } = await supabase
      .from("records")
      .delete()
      .eq("id", id);

    if (supabaseError) {
      throw new Error("error");
    }

    revalidatePath("/", "page");

    return { status: "success" };
  } catch (error) {
    console.log("Database Error: ", error);
    return { status: "error" };
  }
}

// SORTLSIT > ADD : Append a record to the bottom of the sorted list
export async function addRecordToSortOrder({
  mediaType,
  recordId,
}: {
  mediaType: string;
  recordId: number;
}): Promise<Status> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "unauthorised" };
  }

  try {
    const { error } = await supabase.rpc("add_to_sort", {
      media_type: mediaType,
      record_id: recordId,
    });

    if (error) {
      console.log("Error adding record to sort order list:", error);
      return { status: "error" };
    }
    return { status: "success" };
  } catch (error) {
    console.log("Database Error: ", error);
    return { status: "error" };
  }
}

// SORTLSIT > UPDATE SINGLE : Move one record to a new position
export async function moveSingleRecordSortOrder({
  mediaType,
  recordId,
  newPosition,
}: {
  mediaType: string;
  recordId: number;
  newPosition: number;
}): Promise<Status> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "unauthorised" };
  }

  try {
    const { error } = await supabase.rpc("update_single_sort_order", {
      record_id: recordId,
      new_position: newPosition,
      media_type: mediaType,
    });

    if (error) {
      console.log("Error updating record position:", error);
      return { status: "error" };
    }
    return { status: "success" };
  } catch (error) {
    console.log("Database Error: ", error);
    return { status: "error" };
  }
}

// SORTLSIT > REMOVE : Take a record out of the sorted list
export async function removeRecordFromSortOrder({
  mediaType,
  recordId,
}: {
  mediaType: string;
  recordId: number;
}): Promise<Status> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "unauthorised" };
  }

  try {
    const { error } = await supabase.rpc("remove_from_sort", {
      media_type: mediaType,
      record_id: recordId,
    });

    if (error) {
      console.log("Error adding record to sort order list:", error);
      return { status: "error" };
    }
    return { status: "success" };
  } catch (error) {
    console.log("Database Error: ", error);
    return { status: "error" };
  }
}