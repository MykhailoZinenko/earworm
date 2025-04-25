// src/components/shared/SearchInput.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, Clock, Music, User, Disc, ListMusic } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SpotifySearchResult, useSearch } from "@/app/context/SearchContext";
import { useRouter } from "next/navigation";
import { debounce } from "lodash";
import { useClickAway } from "@/hooks/use-click-away";
import { useIsMobile } from "@/hooks/use-responsive";

export function SearchInput() {
  const {
    query,
    setQuery,
    searchResults,
    recentSearches,
    isSearching,
    addToRecentSearches,
    clearRecentSearches,
    performSearch,
    setSearchResults,
  } = useSearch();

  const [isFocused, setIsFocused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const isMobile = useIsMobile();

  useClickAway(dropdownRef, () => {
    setShowResults(false);
  });

  const debouncedSearch = useMemo(
    () =>
      debounce((query: string) => {
        performSearch(query);
      }, 300),
    [performSearch]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const previousValue = query;
    setQuery(value);

    // If we're coming from an empty state to a non-empty state,
    // we should clear previous results to avoid the flash
    if (previousValue.trim() === "" && value.trim() !== "") {
      setSearchResults([]);
    }

    if (value.trim()) {
      setShowResults(true);
      debouncedSearch(value);
    } else {
      setShowResults(isFocused);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    setShowResults(true);
  };

  const handleClear = () => {
    setQuery("");
    setShowResults(false);
    inputRef.current?.focus();
  };

  const handleSelectResult = (result: SpotifySearchResult) => {
    addToRecentSearches(result);
    setShowResults(false);

    switch (result.type) {
      case "track":
        router.push(`/dashboard/track/${result.id}`);
        break;
      case "artist":
        router.push(`/dashboard/artist/${result.id}`);
        break;
      case "album":
        router.push(`/dashboard/album/${result.id}`);
        break;
      case "playlist":
        router.push(`/dashboard/playlist/${result.id}`);
        break;
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "track":
        return <Music className="h-4 w-4" />;
      case "artist":
        return <User className="h-4 w-4" />;
      case "album":
        return <Disc className="h-4 w-4" />;
      case "playlist":
        return <ListMusic className="h-4 w-4" />;
      default:
        return <Music className="h-4 w-4" />;
    }
  };

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

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const renderResultItem = (
    result: SpotifySearchResult,
    isRecent: boolean = false
  ) => (
    <button
      key={`${isRecent ? "recent-" : ""}${result.type}-${result.id}`}
      className="w-full px-3 py-2 md:px-4 md:py-2 flex items-center gap-2 md:gap-3 hover:bg-[#3E3E3E] text-left"
      onClick={() => handleSelectResult(result)}
    >
      <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-[#333333] rounded overflow-hidden">
        {result.imageUrl ? (
          <img
            src={result.imageUrl}
            alt={result.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#B3B3B3]">
            {isRecent ? (
              <Clock className="h-4 w-4" />
            ) : (
              getIconForType(result.type)
            )}
          </div>
        )}
      </div>
      <div className="overflow-hidden flex-1">
        <div className="text-white truncate text-sm md:text-base">
          {result.name}
        </div>
        <div className="text-xs text-[#B3B3B3] flex items-center gap-1">
          {getIconForType(result.type)}
          <span className="capitalize">{result.type}</span>
          {result.artist && ` • ${result.artist}`}
        </div>
      </div>
    </button>
  );

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#B3B3B3]"
          size={18}
        />
        <Input
          ref={inputRef}
          type="text"
          placeholder={
            isMobile ? "Search..." : "What do you want to listen to?"
          }
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          className="h-9 md:h-10 pl-10 pr-10 bg-[#242424] text-white border-none rounded-full focus-visible:ring-1 focus-visible:ring-white text-sm md:text-base"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-[#B3B3B3] hover:text-white"
          >
            <X size={16} />
          </Button>
        )}
      </div>

      {showResults && (
        <div className="absolute mt-2 w-full bg-[#282828] rounded-md shadow-lg z-10 max-h-[70vh] md:max-h-[60vh]">
          {isSearching ? (
            <div className="p-4 text-center text-[#B3B3B3]">Searching...</div>
          ) : query.trim() ? (
            searchResults.length > 0 ? (
              <ScrollArea
                style={{
                  height: `${getDropdownHeight(searchResults.length)}px`,
                }}
              >
                <div className="py-2">
                  <div className="px-4 py-2 text-sm font-semibold text-[#B3B3B3]">
                    Search Results
                  </div>
                  {searchResults.map((result) => renderResultItem(result))}
                </div>
              </ScrollArea>
            ) : (
              <div className="p-4 text-center text-[#B3B3B3]">
                No results found
              </div>
            )
          ) : recentSearches.length > 0 ? (
            <ScrollArea
              style={{
                height: `${getDropdownHeight(recentSearches.length)}px`,
              }}
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
                {recentSearches.map((result) => renderResultItem(result, true))}
              </div>
            </ScrollArea>
          ) : (
            <div className="p-4 text-center text-sm text-[#B3B3B3]">
              No recent searches
            </div>
          )}
        </div>
      )}
    </div>
  );
}
