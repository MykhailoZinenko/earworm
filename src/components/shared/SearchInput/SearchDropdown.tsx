// src/components/shared/SearchInput/SearchDropdown.tsx
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { SpotifySearchResult, useSearch } from "@/app/context/SearchContext";
import { SearchResultItem } from "./SearchResultItem";

interface SearchDropdownProps {
  query: string;
  isSearching: boolean;
  searchResults: SpotifySearchResult[];
  recentSearches: SpotifySearchResult[];
  isMobile: boolean;
}

export function SearchDropdown({
  query,
  isSearching,
  searchResults,
  recentSearches,
  isMobile,
}: SearchDropdownProps) {
  const { clearRecentSearches } = useSearch();

  // Calculate dropdown height based on content
  const getDropdownHeight = (itemCount: number) => {
    const itemHeight = 56;
    const headerHeight = 36;
    const paddingHeight = 16;
    const calculatedHeight =
      headerHeight + itemHeight * itemCount + paddingHeight;
    return Math.min(
      calculatedHeight,
      window.innerHeight * (isMobile ? 0.7 : 0.6)
    );
  };

  if (isSearching) {
    return (
      <div className="absolute mt-2 w-full bg-[#282828] rounded-md shadow-lg z-10">
        <div className="p-4 text-center text-[#B3B3B3]">Searching...</div>
      </div>
    );
  }

  if (query.trim()) {
    if (searchResults.length > 0) {
      return (
        <div className="absolute mt-2 w-full bg-[#282828] rounded-md shadow-lg z-10">
          <ScrollArea
            style={{ height: `${getDropdownHeight(searchResults.length)}px` }}
          >
            <div className="py-2">
              <div className="px-4 py-2 text-sm font-semibold text-[#B3B3B3]">
                Search Results
              </div>
              {searchResults.map((result) => (
                <SearchResultItem
                  key={`result-${result.type}-${result.id}`}
                  result={result}
                  isRecent={false}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      );
    } else {
      return (
        <div className="absolute mt-2 w-full bg-[#282828] rounded-md shadow-lg z-10">
          <div className="p-4 text-center text-[#B3B3B3]">No results found</div>
        </div>
      );
    }
  } else if (recentSearches.length > 0) {
    return (
      <div className="absolute mt-2 w-full bg-[#282828] rounded-md shadow-lg z-10">
        <ScrollArea
          style={{ height: `${getDropdownHeight(recentSearches.length)}px` }}
        >
          <div className="py-2">
            <div className="px-4 py-2 flex justify-between items-center">
              <div className="text-sm font-semibold text-[#B3B3B3]">
                Recent Searches
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearRecentSearches}
                className="h-5 text-xs text-[#B3B3B3] hover:text-white"
              >
                Clear
              </Button>
            </div>
            {recentSearches.map((result) => (
              <SearchResultItem
                key={`recent-${result.type}-${result.id}`}
                result={result}
                isRecent={true}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  } else {
    return (
      <div className="absolute mt-2 w-full bg-[#282828] rounded-md shadow-lg z-10">
        <div className="p-4 text-center text-sm text-[#B3B3B3]">
          No recent searches
        </div>
      </div>
    );
  }
}
