import Header from "./header";
import RecordsListAll from "@/components/records/records-list-all";
import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{
    page?: string;
  }>;
}) {
  const { page } = (await searchParams) || {};
  const currentPage = Number(page) || 1;

  return (
    <div>
      <Header />
      <main className="flex flex-col space-y-4 mb-auto">
        <h1>Recently finished:</h1>
        <Suspense key={currentPage} fallback={<Spinner />}>
          <RecordsListAll currentPage={currentPage} />
        </Suspense>
      </main>
    </div>
  );
}
