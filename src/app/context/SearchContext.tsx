"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

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
  setSearchResults: (results: SpotifySearchResult[]) => void; // Add this line
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
  const { currentSession } = useAuth();
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

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim() || !currentSession) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchResults([]);

    try {
      // Check if the token is valid, refresh if needed (handled by AuthContext)
      const accessToken = currentSession.accessToken;

      // Make the search API call
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          searchQuery
        )}&type=track,artist,album,playlist&limit=5`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log(response);

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();

      console.log(
        data.tracks?.items,
        data.artists?.items,
        data.albums?.items,
        data.playlists?.items
      );

      // Process and combine results
      const formattedResults: SpotifySearchResult[] = [
        // Process tracks
        ...(data.tracks?.items || [])
          .filter((x: any) => x !== null)
          .map((track: any) => ({
            id: track.id,
            name: track.name,
            type: "track" as const,
            imageUrl: track.album?.images?.[0]?.url,
            artist: track.artists?.[0]?.name,
          })),
        // Process artists
        ...(data.artists?.items || [])
          .filter((x: any) => x !== null)
          .map((artist: any) => ({
            id: artist.id,
            name: artist.name,
            type: "artist" as const,
            imageUrl: artist.images?.[0]?.url,
          })),
        // Process albums
        ...(data.albums?.items || [])
          .filter((x: any) => x !== null)
          .map((album: any) => ({
            id: album.id,
            name: album.name,
            type: "album" as const,
            imageUrl: album.images?.[0]?.url,
            artist: album.artists?.[0]?.name,
          })),
        // Process playlists
        ...(data.playlists?.items || [])
          .filter((x: any) => x !== null)
          .map((playlist: any) => ({
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
  };

  // Provide the context
  return (
    <SearchContext.Provider
      value={{
        query,
        setQuery,
        searchResults,
        setSearchResults, // Add this line
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
