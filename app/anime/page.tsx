import { ArrowUpDown } from "lucide-react";
import Header from "../header";
import Link from "next/link";
import RecordsListAnime from "@/components/records/records-list-top-anime";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { parsePage } from "@/lib/config";

export default async function AnimePage({
  searchParams,
}: {
  searchParams?: Promise<{
    page?: string;
  }>;
}) {
  const { page } = (await searchParams) || {};
  const currentPage = parsePage(page);

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  return (
    <div>
      <Header />
      <main className="flex flex-col space-y-4 mb-auto">
        <div className="flex items-center justify-between gap-4">
          <h1>Finished Anime in order of interest</h1>
          {user && (
            <Link
              href="/anime/sort"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <ArrowUpDown strokeWidth={1.5} />
              Sort
            </Link>
          )}
        </div>
        <RecordsListAnime currentPage={currentPage} />
      </main>
    </div>
  );
}
