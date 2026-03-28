import Pagination from "@/components/Pagination";
import RecordListItem from "./records-list-item";
import { notFound } from "next/navigation";
import { searchRecords } from "@/lib/records";

export default async function RecordsSearch({
  searchQuery,
  currentPage = 1,
}: {
  searchQuery: string | undefined
  currentPage?: number;
}) {
  const { posts, count } = await searchRecords({
		searchQuery: searchQuery,
		curentPage: currentPage,
	});

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
