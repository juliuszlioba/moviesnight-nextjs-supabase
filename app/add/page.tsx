import Header from "../header";
import Search from "@/components/Search";
import { Suspense } from "react";
import TmdbList from "@/components/records/tmdb-list";

export default async function RecordAddPage(props: {
  searchParams?: Promise<{
    search?: string;
  }>;
}) {
  const searchParams = await props.searchParams;

  return (
    <main>
      <Header />
      <div className="space-y-4">
        <Search placeholder="Search TMDB" />

        {searchParams?.search && (
          <Suspense fallback={<div>Loading...</div>}>
            <TmdbList searchQuery={searchParams?.search} />
          </Suspense>
        )}
      </div>
    </main>
  );
}
