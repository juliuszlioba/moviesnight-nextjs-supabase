import Pagination from "@/components/Pagination";
import RecordListItem from "./records-list-item";
import { fetchAllRecords } from "@/lib/records";
import { notFound } from "next/navigation";

export default async function RecordsListAll({
  currentPage = 1,
}: {
  currentPage?: number;
}) {
  const { posts, count } = await fetchAllRecords({ curentPage: currentPage });

  if (!posts) {
    return notFound();
  }

  return (
    <div className="divide-y-2 divide-dashed">
      <div className="divide-y-2 divide-dashed">
        {posts.map((post) => {
          return <RecordListItem key={post.id} record={post} />;
        })}
      </div>
      <Pagination curentPage={currentPage} totalCount={count} />
    </div>
  );
}
