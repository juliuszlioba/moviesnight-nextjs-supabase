import Pagination from "@/components/Pagination";
import RecordListItem from "./records-list-item";
import { fetchSortedSeriesRecords } from "@/lib/records";
import { notFound } from "next/navigation";

export default async function RecordsListTopSeries({
  currentPage = 1,
}: {
  currentPage?: number;
}) {
  const { posts, count } = await fetchSortedSeriesRecords({ curentPage: currentPage });

  if (!posts) {
    return notFound();
  }

  return (
    <div className="divide-y-2 divide-dashed">
      <div className="divide-y-2 divide-dashed">
        {posts.map((post) => {
          return <RecordListItem key={post.id} record={post} listBadge={false} />;
        })}
      </div>
      <Pagination
        curentPage={currentPage}
        totalCount={count}
        basePath="/top/series"
      />
    </div>
  );
}
