import { CalendarCheck, Clock, FileEdit, ThumbsUp } from "lucide-react";
import { fetchRecordMetadata, readRecord } from "@/lib/records";
import { formatDisplayDate } from "@/lib/config";
import { isFuture } from "date-fns";

import { Badge } from "../ui/badge";
import Image from "next/image";
import Link from "next/link";
import { StarRating } from "../StarRating";
import { TierBadge } from "../TierBadge";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { toInt } from "radash";

export default async function RecordItem({
  year,
  slug,
}: {
  year: string;
  slug: string;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  const { record } = await readRecord({
    slug: slug,
    year: toInt(year),
  });

  if (!record) {
    notFound();
  }

  const { data: metadata } = await fetchRecordMetadata({
    mediatype: record.mediatype,
    tmdbid: record.tmdbid,
  });

  const externalLinks = (
    <div className="flex gap-2">
      {record.mediatype && record.tmdbid && (
        <a
          className={cn(buttonVariants({ variant: "outline" }))}
          href={`https://www.themoviedb.org/${record.mediatype === "movie" ? "movie" : "tv"}/${record.tmdbid}`}
          target="_blank"
          rel="noreferrer"
        >
          Read More
        </a>
      )}
      {record.anilistid && (
        <a
          className={cn(buttonVariants({ variant: "outline" }))}
          href={`https://anilist.co/anime/${record.anilistid}`}
          target="_blank"
          rel="noreferrer"
        >
          AniList
        </a>
      )}
    </div>
  );

  return (
    <>
      <div className="flex gap-4">
        <div className="relative flex shrink-0 flex-col">
          {record?.poster && (
            <Image
              src={`https://image.tmdb.org/t/p/w200${record.poster}`}
              alt={record?.title || "poster"}
              width={200}
              height={300}
              className="h-75 w-50 shrink-0 overflow-hidden rounded-md border-2 border-gray-900 bg-gray-800"
              unoptimized={true}
            />
          )}
          <TierBadge tier={record.tier} />
        </div>
        <div className="flex flex-col">
          <h2 className="flex items-start justify-between gap-2 pt-4 text-2xl md:justify-start font-light">
            {record?.title}
          </h2>
          <p className="mb-6 text-sm text-gray-400">
            {record?.year && record.year}
          </p>
          {record.sort_order_anime && (
            <div className="-mt-4 mb-6">
              <Badge className="bg-primary/15 text-primary">
                <span className="font-bold">#{record.sort_order_anime}</span>{" "}
                Top Anime
              </Badge>
            </div>
          )}
          <div className="mt-auto">
            {metadata?.runtime && (
              <div className="flex items-center gap-1 pb-2 text-gray-400">
                <Clock strokeWidth={2} className="h-5 w-5" />
                {`${metadata?.runtime} min.`}
              </div>
            )}
            {metadata?.seasons && (
              <div className="flex items-center gap-1 pb-2 text-gray-400">
                {`${metadata?.seasons > 1 ? metadata?.seasons + " Seasons" : "1 Season"}`}{" "}
                | {`${metadata?.episodes}`} Episodes
              </div>
            )}
            <div className="hidden space-y-2 pb-4 sm:block">
              <p>{metadata?.overview}</p>
              {externalLinks}
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-2 py-2 sm:hidden">
        <p>{metadata?.overview}</p>
        {externalLinks}
      </div>

      <div className="mt-4 flex flex-col gap-4 border-t-2 border-dashed border-muted py-4">
        {<StarRating rating={record.rating || 0} />}
        {record.recommendation && (
          <p className="quate text-lg text-yellow-400">
            {record.recommendation}
          </p>
        )}
        {record.review && (
          <div className="border-t-2 border-dashed border-muted pt-4">
            <p className="quate">{record.review}</p>
          </div>
        )}

        {(record.sort_order_movie || record.sort_order_series) && (
          <div className="flex flex-wrap items-center justify-start gap-2 border-t-2 border-dashed border-muted pt-4">
            <ThumbsUp strokeWidth={2} className="text-yellow-400" />
            Highly recommended to see!
          </div>
        )}
      </div>

      <div className="flex justify-between border-t-2 border-dashed border-muted py-4">
        {record.watchedat && (
          <div className="flex items-center gap-2">
            <CalendarCheck strokeWidth={2} />
            {isFuture(new Date(record.watchedat))
              ? "Will finish at"
              : "Watched at"}{" "}
            {formatDisplayDate(record.watchedat)}
          </div>
        )}

        {user && (
          <div className="flex gap-2">
            <Link
              href={`/${record.mediatype}/${record.year}/${record.slug}/edit`}
              className={cn(
                buttonVariants({
                  variant: "default",
                }),
                "gap-2",
              )}
            >
              <FileEdit strokeWidth={2} /> Edit
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
