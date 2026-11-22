import Header from "../header";
import RecordsSearch from "@/components/records/records-list-search";
import Search from "@/components/Search";
import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";
import { parsePage } from "@/lib/config";

export default async function SearchPage(props: {
  searchParams?: Promise<{
    page?: string;
    search?: string;
  }>;
}) {
  const { page, search } = (await props.searchParams) || {};
  const currentPage = parsePage(page);
  const searchQuery = search?.trim();

  return (
    <div>
      <Header />
      <main id="main-content" className="space-y-4">
        <h1 className="text-balance">Search</h1>
        <Search placeholder="Search titles…" />
        {searchQuery && (
          <Suspense key={`${searchQuery}-${currentPage}`} fallback={<Spinner />}>
            <RecordsSearch searchQuery={searchQuery} currentPage={currentPage} />
          </Suspense>
        )}
      </main>
    </div>
  );
}
