import AnimeSortList from "@/components/records/anime-sort-list";
import Header from "../../header";
import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { fetchAllAnimeSortRecords } from "@/lib/records";
import { redirect } from "next/navigation";

export default async function AnimeSortPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect("/anime");
  }

  return (
    <div>
      <Header />
      <main id="main-content" className="flex flex-col space-y-4 mb-auto">
        <Suspense
          fallback={
            <>
              <h1 className="text-balance">Sort Anime List</h1>
              <Spinner />
            </>
          }
        >
          <AnimeSortContent />
        </Suspense>
      </main>
    </div>
  );
}

async function AnimeSortContent() {
  const { posts } = await fetchAllAnimeSortRecords();

  return (
    <>
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-balance">Sort Anime List</h1>
        <p className="text-sm text-muted-foreground">
          {posts.length} records · drag a row, tap its #, or press Alt+↑/↓ on it
        </p>
      </div>
      <AnimeSortList records={posts} />
    </>
  );
}
