import { parsePage } from "@/lib/config";
import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";
import Header from "../../header";
import RecordsListTopMovies from "@/components/records/records-list-top-movies";

export default async function TopMoviesPage({
  searchParams,
}: {
  searchParams?: Promise<{
    page?: string;
  }>;
}) {
  const { page } = (await searchParams) || {};
  const currentPage = parsePage(page);

  return (
    <div>
      <Header />
      <main id="main-content" className="flex flex-col space-y-4 mb-auto">
        <h1 className="text-balance">Highly Recommended Movies</h1>
        <Suspense key={currentPage} fallback={<Spinner />}>
          <RecordsListTopMovies currentPage={currentPage} />
        </Suspense>
      </main>
    </div>
  );
}
