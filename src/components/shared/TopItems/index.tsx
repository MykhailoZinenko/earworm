// src/components/shared/TopItems/index.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Artist, Track } from "@spotify/web-api-ts-sdk";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArtistGrid } from "./ArtistGrid";
import { ArtistDetail } from "./ArtistDetail";
import { FeatureTrackCard } from "./FeaturedTrackCard";
import { TrackList } from "./TrackList";
import { TrackListMobile } from "./TrackListMobile";

interface TopItemsProps {
  timeRange?: "short_term" | "medium_term" | "long_term";
}

export function TopItems({ timeRange = "short_term" }: TopItemsProps) {
  const { spotifyClient } = useAuth();
  const [topArtists, setTopArtists] = useState<Artist[]>([]);
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopItems = async () => {
      if (!spotifyClient) return;

      setIsLoading(true);
      try {
        // Fetch top artists and tracks in parallel
        const [artistsResponse, tracksResponse] = await Promise.all([
          spotifyClient.currentUser.topItems("artists", timeRange, 20),
          spotifyClient.currentUser.topItems("tracks", timeRange, 20),
        ]);

        setTopArtists(artistsResponse.items);
        setTopTracks(tracksResponse.items);

        // Set first artist as selected
        if (artistsResponse.items.length > 0) {
          setSelectedArtist(artistsResponse.items[0]);
        }
      } catch (error) {
        console.error("Error fetching top items:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopItems();
  }, [spotifyClient, timeRange]);

  if (isLoading) {
    return (
      <div className="h-64 md:h-96 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 md:w-12 md:h-12 border-4 border-t-[#1ED760] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-[#B3B3B3]">Loading your top music...</p>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-none shadow-lg bg-gradient-to-b from-[#1E1E1E] to-[#121212] py-0">
      <CardContent className="p-3 md:p-4">
        <Tabs defaultValue="artists" className="w-full">
          <TabsList className="w-full bg-[#333] mb-4">
            <TabsTrigger
              value="artists"
              className="flex-1 data-[state=active]:bg-[#1ED760] data-[state=active]:text-black"
            >
              Top Artists
            </TabsTrigger>
            <TabsTrigger
              value="tracks"
              className="flex-1 data-[state=active]:bg-[#1ED760] data-[state=active]:text-black"
            >
              Top Songs
            </TabsTrigger>
          </TabsList>

          {/* Artists Tab Content */}
          <TabsContent value="artists" className="mt-0">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
              {/* Selected Artist Details - Mobile */}
              <div className="xl:hidden mt-4">
                {selectedArtist && (
                  <ArtistDetail artist={selectedArtist} isMobile={true} />
                )}
              </div>

              {/* Artist Grid */}
              <div className="xl:col-span-2 h-[350px] xl:h-[500px]">
                <ScrollArea className="h-full pr-3">
                  <ArtistGrid
                    artists={topArtists}
                    selectedArtistId={selectedArtist?.id}
                    hoveredItemId={hoveredItemId}
                    onSelectArtist={setSelectedArtist}
                    onHoverChange={setHoveredItemId}
                  />
                </ScrollArea>
              </div>

              {/* Selected Artist Details - Desktop */}
              <div className="hidden xl:block">
                {selectedArtist && (
                  <ArtistDetail artist={selectedArtist} isMobile={false} />
                )}
              </div>
            </div>
          </TabsContent>

          {/* Tracks Tab Content */}
          <TabsContent value="tracks" className="mt-0 space-y-4 xl:space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-6">
              {topTracks.slice(0, 2).map((track, index) => (
                <FeatureTrackCard
                  key={track.id}
                  track={track}
                  index={index}
                  isHovered={hoveredItemId === track.id}
                  onHoverChange={setHoveredItemId}
                />
              ))}
            </div>

            {/* Track List - Desktop */}
            <div className="hidden xl:block bg-[#121212] rounded-xl overflow-hidden">
              <TrackList
                tracks={topTracks.slice(2)}
                startIndex={2}
                hoveredItemId={hoveredItemId}
                onHoverChange={setHoveredItemId}
              />
            </div>

            {/* Track List - Mobile */}
            <div className="xl:hidden space-y-3">
              <TrackListMobile
                tracks={topTracks.slice(2)}
                startIndex={2}
                hoveredItemId={hoveredItemId}
                onHoverChange={setHoveredItemId}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
