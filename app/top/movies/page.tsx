import Header from "../../header";
import RecordsListTopMovies from "@/components/records/records-list-top-movies";

export default async function AnimePage({
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
        <h1>Highly recommended movies by me</h1>
        <RecordsListTopMovies currentPage={currentPage} />
      </main>
    </div>
  );
}
