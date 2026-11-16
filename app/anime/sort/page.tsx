import AnimeSortList from "@/components/records/anime-sort-list";
import Header from "../../header";
import { createClient } from "@/lib/supabase/server";
import { fetchAllAnimeSortRecords } from "@/lib/records";
import { redirect } from "next/navigation";

export default async function AnimeSortPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect("/anime");
  }

  const { posts } = await fetchAllAnimeSortRecords();

  return (
    <div>
      <Header />
      <main className="flex flex-col space-y-4 mb-auto">
        <div className="flex items-baseline justify-between gap-4">
          <h1>Sort anime list</h1>
          <p className="text-sm text-muted-foreground">
            {posts.length} records · drag a row or tap its # to move it
          </p>
        </div>
        <AnimeSortList records={posts} />
      </main>
    </div>
  );
}
