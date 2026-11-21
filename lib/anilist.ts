// Server-only helpers for the public AniList GraphQL API
// (https://docs.anilist.co/reference/). Intentionally NOT "use server": search
// is exposed through an authenticated server action in lib/actions.ts.
import "server-only";

const ANILIST_API = "https://graphql.anilist.co";
const ANILIST_TIMEOUT_MS = 8000;
const ANILIST_MEDIA_REVALIDATE = 60 * 60 * 24; // 1 day

export type AnilistMedia = {
  id: number;
  title: { romaji: string | null; english: string | null };
  format: string | null;
  seasonYear: number | null;
  episodes: number | null;
  coverImage: { medium: string | null } | null;
  siteUrl: string;
};

const MEDIA_FIELDS = `
  id
  title { romaji english }
  format
  seasonYear
  episodes
  coverImage { medium }
  siteUrl
`;

const SEARCH_QUERY = `
  query ($search: String) {
    Page(perPage: 10) {
      media(search: $search, type: ANIME, sort: SEARCH_MATCH) { ${MEDIA_FIELDS} }
    }
  }
`;

const MEDIA_QUERY = `
  query ($id: Int) {
    Media(id: $id, type: ANIME) { ${MEDIA_FIELDS} }
  }
`;

async function anilistQuery<T>(
  query: string,
  variables: Record<string, unknown>,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(ANILIST_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(ANILIST_TIMEOUT_MS),
    ...init,
  });
  const json = await response.json().catch(() => null);
  if (!response.ok || !json?.data) {
    const message = json?.errors?.[0]?.message ?? `status ${response.status}`;
    throw new Error(message);
  }
  return json.data as T;
}

/** Search AniList anime by title. Returns null when the request fails. */
export async function searchAnilistAnime(
  search: string,
): Promise<AnilistMedia[] | null> {
  try {
    const data = await anilistQuery<{ Page: { media: AnilistMedia[] } }>(
      SEARCH_QUERY,
      { search },
      { cache: "no-store" },
    );
    return data.Page.media ?? [];
  } catch (error) {
    console.error("AniList search failed:", error);
    return null;
  }
}

/** One anime by AniList id, cached for a day. Null when missing or failing. */
export async function fetchAnilistAnime(
  id: number | null,
): Promise<AnilistMedia | null> {
  if (!id) return null;
  try {
    const data = await anilistQuery<{ Media: AnilistMedia | null }>(
      MEDIA_QUERY,
      { id },
      { next: { revalidate: ANILIST_MEDIA_REVALIDATE } },
    );
    return data.Media;
  } catch (error) {
    console.error("AniList media fetch failed:", error);
    return null;
  }
}
