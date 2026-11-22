import Pagination from "@/components/Pagination";
import RecordListItem from "./records-list-item";
import { fetchSortedSeriesRecords } from "@/lib/records";
import { notFound } from "next/navigation";

export default async function RecordsListTopSeries({
  currentPage = 1,
}: {
  currentPage?: number;
}) {
  const { posts, count } = await fetchSortedSeriesRecords({ currentPage });

  if (!posts) {
    return notFound();
  }

  return (
    <div className="divide-y-2 divide-dashed">
      <div className="divide-y-2 divide-dashed">
        {posts.map((post, index) => {
          return <RecordListItem key={post.id} record={post} preload={index < 2} listBadge={false} />;
        })}
      </div>
      <Pagination
        currentPage={currentPage}
        totalCount={count}
        basePath="/top/series"
      />
    </div>
  );
}
