import RecordsFilter, {
  RecordsFilterTabs,
} from "@/components/records/records-filter";
import { parsePage, parseRecordFilter } from "@/lib/config";

import Header from "./header";
import RecordsListAll from "@/components/records/records-list-all";
import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";

const HEADINGS = {
  all: "Recently finished",
  movies: "Recently finished movies",
  series: "Recently finished series",
  anime: "Recently finished anime",
} as const;

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{
    page?: string;
    type?: string;
  }>;
}) {
  const { page, type } = (await searchParams) || {};
  const currentPage = parsePage(page);
  const filter = parseRecordFilter(type);

  return (
    <div>
      <Header />
      <main className="flex flex-col space-y-4 mb-auto">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
          <h1>{HEADINGS[filter]}</h1>
          <Suspense fallback={<RecordsFilterTabs active={filter} />}>
            <RecordsFilter active={filter} />
          </Suspense>
        </div>
        <Suspense key={`${filter}-${currentPage}`} fallback={<Spinner />}>
          <RecordsListAll currentPage={currentPage} filter={filter} />
        </Suspense>
      </main>
    </div>
  );
}
