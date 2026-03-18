import { CalendarCheck, Clock, ThumbsUp } from "lucide-react";
import { fetchRecordMetadata, readRecord } from "@/lib/record";
import { format, isFuture } from "date-fns";

import Image from "next/image";
import { StarRating } from "../StarRating";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import { notFound } from "next/navigation";
import { toInt } from "radash";

// import type { User } from '@supabase/supabase-js'

export default async function RecordItem({
  year,
  slug,
  // auth = null,
}: {
  year: string;
  slug: string;
  // auth?: User | null
}) {
  const { record } = await readRecord({
    slug: slug,
    year: toInt(year),
  });

  if (!record) {
    notFound();
  }

  //TODO: Error handling
  const { data: metadata } = await fetchRecordMetadata({
    mediatype: record?.mediatype,
    tmdbid: record.tmdbid as number,
  });

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
        </div>
        <div className="flex flex-col">
          <h2 className="flex items-start justify-between gap-2 pt-4 text-2xl md:justify-start">
            {record?.title}
          </h2>
          <p className="mb-6 text-sm text-gray-400">
            {record?.year && record.year}
          </p>
          <div className="mt-auto">
            {metadata?.runtime && (
              <div className="flex items-center gap-1 pb-2 text-gray-400">
                <Clock strokeWidth={1.5} className="h-5 w-5" />
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
              <div className="flex">
                {record.mediatype && record.tmdbid && (
                  <a
                    className={cn(
                      buttonVariants({
                        variant: "outline",
                      }),
                    )}
                    href={`https://www.themoviedb.org/${record.mediatype === "movie" ? "movie" : "tv"}/${record.tmdbid}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Read More
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-2 py-2 sm:hidden">
        <p>{metadata?.overview}</p>
        <div className="flex">
          {record.mediatype && record.tmdbid && (
            <a
              className={cn(
                buttonVariants({
                  variant: "outline",
                }),
              )}
              href={`https://www.themoviedb.org/${record.mediatype === "movie" ? "movie" : "tv"}/${record.tmdbid}`}
              target="_blank"
              rel="noreferrer"
            >
              Read More
            </a>
          )}
        </div>
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
						<ThumbsUp strokeWidth={1.5} className="text-yellow-400" />
						Highly recommended to see!
					</div>
				)}

        {/* {post.linkanime && listposition && (
					<div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-2 border-t-2 border-dashed border-muted pt-4">
						<div className="flex items-center gap-1">
							<Link
								href="/anime"
								className="text-white underline decoration-primary/50 decoration-2 underline-offset-2 hover:text-primary"
							>
								Anime Top List
							</Link>{' '}
							position
							<span className="ml-1 inline-flex h-9 items-center rounded-md border-2 border-primary px-3 py-1">
								{listposition}
							</span>
						</div>

						{auth && auth.role === 'authenticated' && (
							<EditPostPosition
								id={post.id}
								listposition={listposition}
								list={'list_anime_top'}
							/>
						)}
					</div>
				)} */}
      </div>

      <div className="flex items-center justify-between border-t-2 border-dashed border-muted py-4">
        {record.watchedat && (
          <div className="flex gap-2" suppressHydrationWarning>
            <CalendarCheck strokeWidth={1.5} />
            {isFuture(new Date(record.watchedat))
              ? "Will finish at"
              : "Last watch"}{" "}
            {format(new Date(record.watchedat), "yyyy-MM-dd")}
          </div>
        )}

        {/* {auth && auth.role === 'authenticated' && (
					<div className="flex gap-2">
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button
									variant={'ghost'}
									className="gap-2 text-red-500 text-opacity-40"
								>
									<Trash strokeWidth={1.5} />
									Delete
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
									<AlertDialogDescription>
										This action cannot be undone. This will{' '}
										<span className="text-red-500">permanently</span> delete
										Post.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter className="flex items-center">
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<PostDeleteButton
										id={post.id}
										postMeta={{
											mediaType: post.mediatype,
											linkanime: post.linkanime,
											recommended: post.recommended,
										}}
									/>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>

						<Link
							href={`/${record.mediatype}/${record.year}/${record.slug}/edit`}
							className={cn(
								buttonVariants({
									variant: 'ghost',
								}),
								'gap-2'
							)}
						>
							<FileEdit strokeWidth={1.5} className="h-6 w-6" /> Edit
						</Link>
					</div>
				)} */}
      </div>
    </>
  );
}
