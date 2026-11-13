import Pagination from "@/components/Pagination";
import RecordListItem from "./records-list-item";
import { searchRecords } from "@/lib/records";

export default async function RecordsSearch({
  searchQuery,
  currentPage = 1,
}: {
  searchQuery: string;
  currentPage?: number;
}) {
  const { posts, count } = await searchRecords({
    searchQuery,
    curentPage: currentPage,
  });

  if (!posts || posts.length === 0) {
    return <p className="text-muted-foreground">No results found.</p>;
  }

  return (
    <div className="divide-y-2 divide-dashed">
      <div className="divide-y-2 divide-dashed">
        {posts.map((post) => (
          <RecordListItem key={post.id} record={post} />
        ))}
      </div>
      <Pagination
        curentPage={currentPage}
        totalCount={count}
        basePath="/search"
        query={{ search: searchQuery }}
      />
    </div>
  );
}
