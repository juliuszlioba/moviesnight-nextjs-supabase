"use client";

import { MessageCircle, ThumbsUp } from "lucide-react";

import { Button } from "../ui/button";
import { Database } from "@/lib/database.types";
import Image from "next/image";
import Link from "next/link";
import { StarRating } from "../StarRating";
import { TierBadge } from "../TierBadge";
import { Transition } from "@headlessui/react";
import { useState } from "react";

export default function RecordListItem({
  record,
  listBadge = true,
  preload = false,
}: {
  record: Database["public"]["Tables"]["records"]["Row"];
  listBadge?: boolean;
  /** Preload the poster (first rows, likely the LCP image) */
  preload?: boolean;
}) {
  const [reviewOpen, setOpenReview] = useState(false);

  if (!record) return null;

  return (
    <>
      <div className="py-4 first:pt-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="flex gap-4">
            <div className="relative flex shrink-0 flex-col">
              {record.poster ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w200${record.poster}`}
                  alt={record.title || "poster"}
                  width={200}
                  height={300}
                  className="h-52 w-36 shrink-0 overflow-hidden rounded-lg bg-muted"
                  unoptimized={true}
                  preload={preload}
                />
              ) : (
                <div className="h-52 w-36 shrink-0 rounded-lg bg-muted" />
              )}
              <TierBadge tier={record.tier} />

              {listBadge && (record.sort_order_movie || record.sort_order_series) && (
                <div className="absolute bottom-3 -left-2 -rotate-6">
                  <span className="rounded-md p-1.5 text-white flex items-center bg-yellow-400 shadow-yellow-500/50 shadow-lg">
                    <ThumbsUp strokeWidth={2} className="text-background" />
                  </span>
                </div>
              )}
            </div>
            <div className="flex w-full flex-col">
              <div className="flex items-start justify-between gap-2 pt-4 sm:justify-start">
                <Link
                  href={`/${record.mediatype}/${record.year}/${record.slug}`}
                  className="-ml-1 rounded-md px-1.5 py-0.5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                >
                  <h2 className="text-xl sm:text-2xl font-light">
                    {record.title}
                  </h2>
                </Link>
              </div>
              <p className="text-sm text-gray-400">{record.year}</p>

              {(record.recommendation || record.review) && (
                <div className="mt-auto hidden items-center gap-2 pb-4 sm:flex">
                  {record.recommendation && (
                    <p className={`quote`}>{record.recommendation}</p>
                  )}

                  {record.review && (
                    <Button
                      onClick={() => setOpenReview(!reviewOpen)}
                      aria-expanded={reviewOpen}
                      variant={"outline"}
                      className="gap-1"
                    >
                      <MessageCircle strokeWidth={2} className="h-6 w-6" />
                      More…
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <StarRating rating={record.rating || 0} />
          </div>

          {(record.recommendation || record.review) && (
            <div
              className={`flex items-center justify-between gap-2 pt-2 sm:hidden`}
            >
              {record.recommendation && (
                <p className={`quote gap-2`}>{record.recommendation}</p>
              )}
              {record.review && (
                <Button
                  onClick={() => setOpenReview(!reviewOpen)}
                      aria-expanded={reviewOpen}
                  variant={"ghost"}
                >
                  <MessageCircle strokeWidth={2} className="h-6 w-6" />
                  More…
                </Button>
              )}
            </div>
          )}
        </div>
        {record.review && (
          <Transition
            show={reviewOpen}
            enter="transition duration-250 origin-top ease-out"
            enterFrom="transform opacity-0"
            enterTo="transform opacity-100"
            leave="transition duration-150 origin-top ease-out"
            leaveFrom="transform opacity-100"
            leaveTo="transform opacity-0"
          >
            <p className="mt-4 block whitespace-pre-line break-words rounded-md bg-muted px-4 py-3">
              {record.review}
            </p>
          </Transition>
        )}
      </div>
    </>
  );
}
