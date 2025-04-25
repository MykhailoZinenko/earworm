// src/components/shared/SearchInput/index.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearch } from "@/app/context/SearchContext";
import { debounce } from "lodash";
import { useClickAway } from "@/hooks/use-click-away";
import { useIsMobile } from "@/hooks/use-responsive";
import { SearchDropdown } from "./SearchDropdown";

export function SearchInput() {
  const {
    query,
    setQuery,
    searchResults,
    recentSearches,
    isSearching,
    performSearch,
    setSearchResults,
  } = useSearch();

  const [isFocused, setIsFocused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
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

    // Clear previous results when going from empty to non-empty
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

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <SearchBar
        query={query}
        inputRef={inputRef}
        onInputChange={handleInputChange}
        onFocus={handleFocus}
        onClear={handleClear}
        isMobile={isMobile}
      />

      {showResults && (
        <SearchDropdown
          query={query}
          isSearching={isSearching}
          searchResults={searchResults}
          recentSearches={recentSearches}
          isMobile={isMobile}
        />
      )}
    </div>
  );
}

interface SearchBarProps {
  query: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus: () => void;
  onClear: () => void;
  isMobile: boolean;
}

function SearchBar({
  query,
  inputRef,
  onInputChange,
  onFocus,
  onClear,
  isMobile,
}: SearchBarProps) {
  return (
    <div className="relative">
      <Search
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#B3B3B3]"
        size={18}
      />
      <Input
        ref={inputRef}
        type="text"
        placeholder={isMobile ? "Search..." : "What do you want to listen to?"}
        value={query}
        onChange={onInputChange}
        onFocus={onFocus}
        className="h-9 md:h-10 pl-10 pr-10 bg-[#242424] text-white border-none rounded-full focus-visible:ring-1 focus-visible:ring-white text-sm md:text-base"
      />
      {query && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onClear}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-[#B3B3B3] hover:text-white"
        >
          <X size={16} />
        </Button>
      )}
    </div>
  );
}
