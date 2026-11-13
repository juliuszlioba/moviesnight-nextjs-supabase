import TmdbListItem from "./tmdb-list-item";
import { fetchTmdbSearchResults } from "@/lib/records";

export default async function TmdbList({
  searchQuery,
}: {
  searchQuery: string | undefined;
}) {
  if (!searchQuery) return null;

  const searchResults = await fetchTmdbSearchResults({ searchQuery });

  if (searchResults === null) {
    return (
      <p className="text-destructive">
        TMDB search failed. Please try again later.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="border-b-2 border-dashed border-muted pb-4">
        Search for: <span className="font-semibold">{searchQuery}</span>
      </div>

      {searchResults.length > 0 ? (
        searchResults.map((searchItem) => (
          <TmdbListItem key={searchItem.id} record={searchItem} />
        ))
      ) : (
        <p className="text-muted-foreground">No results found.</p>
      )}
    </div>
  );
}
