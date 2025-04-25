// src/app/context/SearchContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import { SearchResults } from "@spotify/web-api-ts-sdk";

// Define the types of search results we'll get from Spotify
export interface SpotifySearchResult {
  id: string;
  name: string;
  type: "track" | "artist" | "album" | "playlist";
  imageUrl?: string;
  artist?: string;
}

// Define what our search context will provide
interface SearchContextType {
  query: string;
  setQuery: (query: string) => void;
  searchResults: SpotifySearchResult[];
  setSearchResults: (results: SpotifySearchResult[]) => void;
  recentSearches: SpotifySearchResult[];
  isSearching: boolean;
  addToRecentSearches: (result: SpotifySearchResult) => void;
  clearRecentSearches: () => void;
  performSearch: (query: string) => Promise<void>;
}

// Create context with default values
const SearchContext = createContext<SearchContextType>({
  query: "",
  setQuery: () => {},
  searchResults: [],
  setSearchResults: () => {},
  recentSearches: [],
  isSearching: false,
  addToRecentSearches: () => {},
  clearRecentSearches: () => {},
  performSearch: async () => {},
});

// Maximum number of recent searches to store
const MAX_RECENT_SEARCHES = 5;
const RECENT_SEARCHES_KEY = "earworm_recent_searches";

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const { spotifyClient } = useAuth();
  const [query, setQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SpotifySearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<SpotifySearchResult[]>(
    []
  );
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    const storedSearches = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (storedSearches) {
      try {
        setRecentSearches(JSON.parse(storedSearches));
      } catch (error) {
        console.error("Failed to parse recent searches:", error);
      }
    }
  }, []);

  // Save recent searches to localStorage when changed
  useEffect(() => {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recentSearches));
  }, [recentSearches]);

  // Add a result to recent searches
  const addToRecentSearches = (result: SpotifySearchResult) => {
    setRecentSearches((prev) => {
      // Remove if already exists (to avoid duplicates)
      const filtered = prev.filter((item) => item.id !== result.id);
      // Add to beginning and limit to max items
      return [result, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    });
  };

  // Clear all recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  const performSearch = useCallback(
    async (searchQuery: string) => {
      console.log(spotifyClient);
      if (!searchQuery.trim() || !spotifyClient) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      setSearchResults([]);

      try {
        // Use the SDK to perform the search
        const results: SearchResults<["track", "artist", "album", "playlist"]> =
          await spotifyClient.search(
            searchQuery,
            ["track", "artist", "album", "playlist"],
            undefined,
            5
          );

        console.log(searchQuery, spotifyClient, searchResults);

        // Process and combine results
        const formattedResults: SpotifySearchResult[] = [
          // Process tracks - filter out nulls first
          ...(results.tracks?.items || [])
            .filter((track) => track !== null)
            .map((track) => ({
              id: track.id,
              name: track.name,
              type: "track" as const,
              imageUrl: track.album?.images?.[0]?.url,
              artist: track.artists?.[0]?.name,
            })),
          // Process artists - filter out nulls first
          ...(results.artists?.items || [])
            .filter((artist) => artist !== null)
            .map((artist) => ({
              id: artist.id,
              name: artist.name,
              type: "artist" as const,
              imageUrl: artist.images?.[0]?.url,
            })),
          // Process albums - filter out nulls first
          ...(results.albums?.items || [])
            .filter((album) => album !== null)
            .map((album) => ({
              id: album.id,
              name: album.name,
              type: "album" as const,
              imageUrl: album.images?.[0]?.url,
              artist: album.artists?.[0]?.name,
            })),
          // Process playlists - filter out nulls first
          ...(results.playlists?.items || [])
            .filter((playlist) => playlist !== null)
            .map((playlist) => ({
              id: playlist.id,
              name: playlist.name,
              type: "playlist" as const,
              imageUrl: playlist.images?.[0]?.url,
            })),
        ];

        setSearchResults(formattedResults);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [spotifyClient]
  );

  // Provide the context
  return (
    <SearchContext.Provider
      value={{
        query,
        setQuery,
        searchResults,
        setSearchResults,
        recentSearches,
        isSearching,
        addToRecentSearches,
        clearRecentSearches,
        performSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

// Custom hook to use the search context
export function useSearch() {
  return useContext(SearchContext);
}
