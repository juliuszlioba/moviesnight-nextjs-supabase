const POSTLIMIT = toInt(process.env.NEXT_PUBLIC_POSTS_LIMIT);
const GRIDPOSTLIMIT = toInt(process.env.NEXT_PUBLIC_POSTS_GRID_LIMIT);

import { Button } from "./ui/button";
import Link from "next/link";
import { toInt } from "radash";

const PageButton = ({
  number,
  urlPrefix,
  samepage,
}: {
  number: number;
  urlPrefix: string;
  samepage: boolean;
}) => {
  return (
    <Link
      href={`${urlPrefix === "" ? "" : "/" + urlPrefix}${
        samepage ? "&" : "/?"
      }page=${number}`}
    >
      <Button variant={"outline"}>
        {number}
      </Button>
    </Link>
  );
};

export default function Pagination({
  curentPage,
  totalCount,
  urlPrefix = "",
  samepage = false,
  grid = false,
}: {
  curentPage: number;
  totalCount: number;
  urlPrefix?: string;
  samepage?: boolean;
  grid?: boolean;
}) {
  const postsLimit = grid ? GRIDPOSTLIMIT : POSTLIMIT;
  const lastPage =
    Math.floor(totalCount / postsLimit) + (totalCount % postsLimit > 0 ? 1 : 0);

  if (lastPage <= 1) {
    return null;
  }

  if (totalCount <= postsLimit) {
    return null;
  }

  return (
    <div className="flex w-full flex-col items-center gap-4 py-4 sm:flex-row sm:justify-between">
      <div className="max-sm:hidden">{`Page ${curentPage} of ${lastPage}`}</div>
      <div className="flex items-center gap-2">
        {curentPage > 1 ? (
          <PageButton number={1} samepage={samepage} urlPrefix={urlPrefix} />
        ) : (
          <Button>
            1
          </Button>
        )}
        {curentPage > 4 && <p>...</p>}
        {curentPage > 3 && <PageButton number={curentPage - 2} samepage={samepage} urlPrefix={urlPrefix} />}
        {curentPage > 2 && <PageButton number={curentPage - 1} samepage={samepage} urlPrefix={urlPrefix} />}
        {curentPage > 1 && curentPage < lastPage && (
          <Button >
            {curentPage}
          </Button>
        )}
        {curentPage < lastPage - 1 && <PageButton number={curentPage + 1} samepage={samepage} urlPrefix={urlPrefix} />}
        {curentPage < lastPage - 2 && <PageButton number={curentPage + 2} samepage={samepage} urlPrefix={urlPrefix} />}
        {curentPage < lastPage - 3 && <p>...</p>}

        {curentPage < lastPage ? (
          <PageButton number={lastPage} samepage={samepage} urlPrefix={urlPrefix} />
        ) : (
          <Button >
            {lastPage}
          </Button>
        )}
      </div>
    </div>
  );
}
