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
        {posts.map((post, index) => {
          return <RecordListItem key={index} record={post} auth={null} />;
        })}
      </div>
      <Pagination curentPage={currentPage} totalCount={count} />
    </div>
  );
}
