import { parsePage } from "@/lib/config";
import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";
import Header from "../../header";
import RecordsListTopSeries from "@/components/records/records-list-top-series";

export default async function TopSeriesPage({
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
      <main className="flex flex-col space-y-4 mb-auto">
        <h1>Highly recommended series by me</h1>
        <Suspense key={currentPage} fallback={<Spinner />}>
          <RecordsListTopSeries currentPage={currentPage} />
        </Suspense>
      </main>
    </div>
  );
}
