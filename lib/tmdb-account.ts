// Server-only helpers that write to the owner's TMDB account (ratings and
// watchlist). Intentionally NOT "use server" so they are not exposed as
// public endpoints; they are only called from authenticated server actions.
import "server-only";

const TMDB_API = "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env.TMDB_API_KEY;
// Created once with `pnpm tmdb:session` (see README). Without it, syncing is
// silently disabled and the app works as before.
const TMDB_SESSION_ID = process.env.TMDB_SESSION_ID;
const TMDB_TIMEOUT_MS = 8000;

// "unauthorized" = TMDB rejected TMDB_SESSION_ID (revoked or invalidated)
export type TmdbSyncResult = "synced" | "skipped" | "failed" | "unauthorized";

class TmdbUnauthorizedError extends Error {}

/** Throw on a non-OK response; 401 gets its own error type. */
function assertOk(res: Response, allow: number[] = []) {
  if (res.ok || allow.includes(res.status)) return;
  if (res.status === 401) throw new TmdbUnauthorizedError("status 401");
  throw new Error(`status ${res.status}`);
}

function failure(label: string, error: unknown): TmdbSyncResult {
  if (error instanceof TmdbUnauthorizedError) {
    console.error(`${label}: TMDB session is invalid. Run \`pnpm tmdb:session\`.`);
    return "unauthorized";
  }
  console.error(`${label}:`, error);
  return "failed";
}

type MediaType = "movie" | "series" | string;

function tmdbType(mediatype: MediaType) {
  return mediatype === "movie" ? "movie" : "tv";
}

function isEnabled() {
  return Boolean(TMDB_API_KEY && TMDB_SESSION_ID);
}

async function tmdbFetch(
  path: string,
  init: { method: "GET" | "POST" | "DELETE"; body?: unknown },
): Promise<Response> {
  const url = new URL(`${TMDB_API}${path}`);
  url.searchParams.set("api_key", TMDB_API_KEY ?? "");
  url.searchParams.set("session_id", TMDB_SESSION_ID ?? "");

  return fetch(url, {
    method: init.method,
    headers: { "Content-Type": "application/json;charset=utf-8" },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
    signal: AbortSignal.timeout(TMDB_TIMEOUT_MS),
  });
}

let accountIdPromise: Promise<number> | null = null;

/** The account id behind TMDB_SESSION_ID, cached per server instance. */
function getAccountId(): Promise<number> {
  accountIdPromise ??= tmdbFetch("/account", { method: "GET" })
    .then(async (res) => {
      assertOk(res);
      const data = await res.json();
      if (!Number.isInteger(data?.id)) throw new Error("no account id");
      return data.id as number;
    })
    .catch((error) => {
      accountIdPromise = null; // retry on the next call
      throw error;
    });
  return accountIdPromise;
}

/**
 * Mirror a record's score to TMDB. A rating of 1–10 is set on TMDB as-is
 * (TMDB accepts 0.5–10); 0 means "not rated yet" and removes the TMDB rating.
 * Rated titles are what TMDB shows as watched, and rating also takes the
 * title off the TMDB watchlist.
 */
export async function syncTmdbRating({
  mediatype,
  tmdbid,
  rating,
}: {
  mediatype: MediaType;
  tmdbid: number | null;
  rating: number;
}): Promise<TmdbSyncResult> {
  if (!isEnabled() || !tmdbid) return "skipped";

  const path = `/${tmdbType(mediatype)}/${tmdbid}/rating`;

  try {
    if (rating > 0) {
      const value = Math.min(10, Math.max(0.5, Math.round(rating * 2) / 2));
      const res = await tmdbFetch(path, { method: "POST", body: { value } });
      assertOk(res);
    } else {
      const res = await tmdbFetch(path, { method: "DELETE" });
      // 404 = there was no rating to remove; that's fine.
      assertOk(res, [404]);
    }
    return "synced";
  } catch (error) {
    return failure("TMDB rating sync failed", error);
  }
}

/**
 * Called when a title is added to the app: it has been watched, so take it
 * off the TMDB watchlist. (TMDB has no separate "watched" list; a title
 * counts as watched once it is rated, which happens on the first score save.)
 */
export async function markTmdbWatched({
  mediatype,
  tmdbid,
}: {
  mediatype: MediaType;
  tmdbid: number | null;
}): Promise<TmdbSyncResult> {
  if (!isEnabled() || !tmdbid) return "skipped";

  try {
    const accountId = await getAccountId();

    const res = await tmdbFetch(`/account/${accountId}/watchlist`, {
      method: "POST",
      body: {
        media_type: tmdbType(mediatype),
        media_id: tmdbid,
        watchlist: false,
      },
    });
    assertOk(res);
    return "synced";
  } catch (error) {
    return failure("TMDB watchlist sync failed", error);
  }
}
