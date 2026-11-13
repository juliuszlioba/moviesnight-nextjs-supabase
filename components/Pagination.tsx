import { GRID_POSTS_LIMIT, POSTS_LIMIT } from "@/lib/config";

import { Button } from "./ui/button";
import Link from "next/link";

function pageHref(
  basePath: string,
  query: Record<string, string> | undefined,
  page: number,
) {
  const params = new URLSearchParams(query);
  if (page > 1) {
    params.set("page", String(page));
  } else {
    params.delete("page");
  }
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export default function Pagination({
  curentPage,
  totalCount,
  basePath = "/",
  query,
  grid = false,
}: {
  curentPage: number;
  totalCount: number;
  /** Path of the listing page, e.g. "/top/movies" */
  basePath?: string;
  /** Extra query params to keep, e.g. { search: "alien" } */
  query?: Record<string, string>;
  grid?: boolean;
}) {
  const postsLimit = grid ? GRID_POSTS_LIMIT : POSTS_LIMIT;
  const lastPage = Math.ceil(totalCount / postsLimit);

  if (lastPage <= 1) {
    return null;
  }

  const pageButton = (number: number) =>
    number === curentPage ? (
      <Button aria-current="page">{number}</Button>
    ) : (
      <Button variant={"outline"} asChild>
        <Link href={pageHref(basePath, query, number)}>{number}</Link>
      </Button>
    );

  return (
    <nav
      aria-label="Pagination"
      className="flex w-full flex-col items-center gap-4 py-4 sm:flex-row sm:justify-between"
    >
      <div className="max-sm:hidden">{`Page ${curentPage} of ${lastPage}`}</div>
      <div className="flex items-center gap-2">
        {pageButton(1)}
        {curentPage > 4 && <p>...</p>}
        {curentPage > 3 && pageButton(curentPage - 2)}
        {curentPage > 2 && pageButton(curentPage - 1)}
        {curentPage > 1 && curentPage < lastPage && (
          pageButton(curentPage)
        )}
        {curentPage < lastPage - 1 && pageButton(curentPage + 1)}
        {curentPage < lastPage - 2 && pageButton(curentPage + 2)}
        {curentPage < lastPage - 3 && <p>...</p>}
        {pageButton(lastPage)}
      </div>
    </nav>
  );
}
