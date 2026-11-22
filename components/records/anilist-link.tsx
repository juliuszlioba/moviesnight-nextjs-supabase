"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ExternalLink, Link2, Search, Unlink } from "lucide-react";
import { useState, type KeyboardEvent } from "react";

import type { AnilistMedia } from "@/lib/anilist";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Spinner } from "../ui/spinner";
import { searchAnilist } from "@/lib/actions";
import { toast } from "sonner";

function anilistUrl(id: number | string) {
  return `https://anilist.co/anime/${id}`;
}

function mediaTitle(media: AnilistMedia) {
  return media.title.english || media.title.romaji || `AniList #${media.id}`;
}

function mediaDetails(media: AnilistMedia) {
  return [
    media.format?.replace(/_/g, " "),
    media.seasonYear,
    media.episodes && `${media.episodes} ep.`,
  ]
    .filter(Boolean)
    .join(" · ");
}

function MediaRow({
  media,
  action,
}: {
  media: AnilistMedia;
  action: React.ReactNode;
}) {
  const romaji =
    media.title.english && media.title.romaji !== media.title.english
      ? media.title.romaji
      : null;

  return (
    <div className="flex items-center gap-3">
      {media.coverImage?.medium ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={media.coverImage.medium}
          alt=""
          width={44}
          height={64}
          className="h-16 w-11 shrink-0 rounded border border-gray-900 bg-gray-800 object-cover"
          loading="lazy"
        />
      ) : (
        <div className="h-16 w-11 shrink-0 rounded border border-gray-900 bg-gray-800" />
      )}
      <div className="min-w-0 flex-1">
        <a
          href={anilistUrl(media.id)}
          target="_blank"
          rel="noreferrer"
          className="line-clamp-1 font-medium hover:underline"
        >
          {mediaTitle(media)}
          <span className="sr-only"> (opens in new tab)</span>
        </a>
        {romaji && (
          <p className="line-clamp-1 text-xs text-muted-foreground">{romaji}</p>
        )}
        <p className="text-xs text-muted-foreground">{mediaDetails(media)}</p>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}

/**
 * Search AniList and pick the anime this record links to. Controlled by the
 * edit form: `value` is the AniList id as a string ("" = not linked), and the
 * change is stored when the form is saved.
 */
export function AnilistLink({
  value,
  onChange,
  savedValue,
  initialMedia,
  defaultQuery,
}: {
  value: string;
  onChange: (value: string) => void;
  /** The id currently stored on the record ("" = none). */
  savedValue: string;
  initialMedia: AnilistMedia | null;
  defaultQuery: string;
}) {
  const [query, setQuery] = useState(defaultQuery);
  const [results, setResults] = useState<AnilistMedia[] | null>(null);
  const [searching, setSearching] = useState(false);
  // Details of the picked anime, so the linked entry shows without a refetch
  const [picked, setPicked] = useState<AnilistMedia | null>(initialMedia);

  const linked =
    value && picked && String(picked.id) === value ? picked : null;
  const unsaved = value !== savedValue;

  async function runSearch() {
    if (searching || !query.trim()) return;
    setSearching(true);
    try {
      const response = await searchAnilist({ query });
      if (response.status === "success") {
        setResults(response.results);
      } else {
        toast.error(
          response.status === "unauthorised"
            ? "Not logged in"
            : response.message || "AniList search failed",
        );
      }
    } catch {
      toast.error("AniList search failed");
    } finally {
      setSearching(false);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    // Enter would otherwise submit the surrounding edit form
    if (e.key === "Enter") {
      e.preventDefault();
      runSearch();
    }
  }

  function link(media: AnilistMedia) {
    setPicked(media);
    onChange(String(media.id));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AniList</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {value ? (
          linked ? (
            <MediaRow
              media={linked}
              action={
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  onClick={() => onChange("")}
                >
                  <Unlink strokeWidth={2} /> Unlink
                </Button>
              }
            />
          ) : (
            <div className="flex items-center justify-between gap-3">
              <a
                href={anilistUrl(value)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:underline"
              >
                AniList #{value} <ExternalLink className="size-4" />
                <span className="sr-only"> (opens in new tab)</span>
              </a>
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() => onChange("")}
              >
                <Unlink strokeWidth={2} /> Unlink
              </Button>
            </div>
          )
        ) : (
          <p className="text-sm text-muted-foreground">
            Not linked. Search AniList to link this record.
          </p>
        )}

        {unsaved && (
          <p className="text-xs text-yellow-400">Save the record to apply.</p>
        )}

        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search anime on AniList"
            aria-label="Search anime on AniList"
            autoComplete="off"
          />
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            disabled={searching || !query.trim()}
            onClick={runSearch}
          >
            {searching ? <Spinner /> : <Search strokeWidth={2} />}
            Search
          </Button>
        </div>

        {results &&
          (results.length === 0 ? (
            <p className="text-sm text-muted-foreground">No anime found.</p>
          ) : (
            <div className="space-y-3">
              {results.map((media) => (
                <MediaRow
                  key={media.id}
                  media={media}
                  action={
                    String(media.id) === value ? (
                      <Button type="button" variant="secondary" disabled>
                        Linked
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        className="gap-2"
                        onClick={() => link(media)}
                      >
                        <Link2 strokeWidth={2} /> Link
                      </Button>
                    )
                  }
                />
              ))}
            </div>
          ))}
      </CardContent>
    </Card>
  );
}
