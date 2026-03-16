import Pagination from "@/components/Pagination";
import RecordListItem from "./records-list-item";
import { fetchSortedAnimeRecords } from "@/lib/records";
import { notFound } from "next/navigation";

export default async function RecordsListAnime({
  currentPage = 1,
}: {
  currentPage?: number;
}) {
  const { posts, count } = await fetchSortedAnimeRecords({ curentPage: currentPage });

  if (!posts) {
    return notFound();
  }

  return (
    <div className="divide-y-2 divide-dashed">
      <div className="divide-y-2 divide-dashed">
        {posts.map((post, index) => {
          return <RecordListItem key={index} record={post} auth={null} listRating listBadge={false} />;
        })}
      </div>
      <Pagination
        curentPage={currentPage}
        totalCount={count}
        urlPrefix={"anime"}
      />
    </div>
  );
}
