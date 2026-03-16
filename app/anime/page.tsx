import Header from "../header";
import RecordsListAnime from "@/components/records/records-list-top-anime";

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
        <h1>Finished Anime in order of interest</h1>
        <RecordsListAnime currentPage={currentPage} />
      </main>
    </div>
  );
}
