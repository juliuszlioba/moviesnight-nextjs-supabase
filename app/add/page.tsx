import Header from "../header";
import Search from "@/components/Search";
import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";
import TmdbList from "@/components/records/tmdb-list";

export default async function RecordAddPage(props: {
  searchParams?: Promise<{
    search?: string;
  }>;
}) {
  const searchParams = await props.searchParams;

  return (
    <>
      <Header />
      <main id="main-content">
      <div className="space-y-4">
        <Search placeholder="Search TMDB…" />

        {searchParams?.search && (
          <Suspense fallback={<Spinner />}>
            <TmdbList searchQuery={searchParams?.search} />
          </Suspense>
        )}
      </div>
    </main>
    </>
  );
}
