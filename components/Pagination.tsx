import { GRID_POSTS_LIMIT, POSTS_LIMIT } from "@/lib/config";

import { Button, buttonVariants } from "./ui/button";
import { Input } from "./ui/input";
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
  currentPage,
  totalCount,
  basePath = "/",
  query,
  grid = false,
}: {
  currentPage: number;
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
    number === currentPage ? (
      <span aria-current="page" className={buttonVariants()}>
        {number}
      </span>
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
      <div className="tabular-nums max-sm:hidden">{`Page ${currentPage} of ${lastPage}`}</div>
      <div className="flex items-center gap-2">
        {pageButton(1)}
        {currentPage > 4 && <span aria-hidden="true">…</span>}
        {currentPage > 3 && pageButton(currentPage - 2)}
        {currentPage > 2 && pageButton(currentPage - 1)}
        {currentPage > 1 && currentPage < lastPage && (
          pageButton(currentPage)
        )}
        {currentPage < lastPage - 1 && pageButton(currentPage + 1)}
        {currentPage < lastPage - 2 && pageButton(currentPage + 2)}
        {currentPage < lastPage - 3 && <span aria-hidden="true">…</span>}
        {pageButton(lastPage)}
      </div>
      <form
        action={basePath}
        method="get"
        className="flex items-center gap-2"
      >
        {Object.entries(query ?? {})
          .filter(([key]) => key !== "page")
          .map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))}
        <Input
          type="number"
          name="page"
          min={1}
          max={lastPage}
          required
          placeholder="Page"
          aria-label="Go to page"
          className="w-20"
        />
        <Button type="submit" variant={"outline"}>
          Go
        </Button>
      </form>
    </nav>
  );
}
