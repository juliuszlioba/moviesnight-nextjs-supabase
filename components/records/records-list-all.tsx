import Pagination from "@/components/Pagination";
import RecordListItem from "./records-list-item";
import type { RecordFilter } from "@/lib/config";
import { fetchAllRecords } from "@/lib/records";
import { notFound } from "next/navigation";

export default async function RecordsListAll({
  currentPage = 1,
  filter = "all",
}: {
  currentPage?: number;
  filter?: RecordFilter;
}) {
  const { posts, count } = await fetchAllRecords({
    curentPage: currentPage,
    filter,
  });

  if (!posts) {
    return notFound();
  }

  if (posts.length === 0) {
    return (
      <p className="rounded-md bg-muted px-4 py-6 text-center text-muted-foreground">
        Nothing here yet.
      </p>
    );
  }

  return (
    <div className="divide-y-2 divide-dashed">
      <div className="divide-y-2 divide-dashed">
        {posts.map((post) => {
          return <RecordListItem key={post.id} record={post} />;
        })}
      </div>
      <Pagination
        curentPage={currentPage}
        totalCount={count}
        query={filter === "all" ? undefined : { type: filter }}
      />
    </div>
  );
}
