// src/components/shared/TopItems.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Artist, Track } from "@spotify/web-api-ts-sdk";
import { PlusCircle, Play, ExternalLink, Clock } from "lucide-react";
import Link from "next/link";
import { useIsMobile } from "@/hooks/use-responsive";

// Import shadcn components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const isMobile = useIsMobile();

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

  // Function to calculate dynamic background style based on artist image
  const getArtistBackgroundStyle = (artist: Artist) => {
    if (!artist.images || artist.images.length === 0) {
      return {};
    }

    return {
      backgroundImage: `linear-gradient(to bottom, rgba(18, 18, 18, 0.7), rgba(18, 18, 18, 1)), url(${artist.images[0].url})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  };

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
              Top Tracks
            </TabsTrigger>
          </TabsList>

          {/* Artists Tab Content */}
          <TabsContent value="artists" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Artist Grid */}
              <div className="lg:col-span-2 h-[350px] md:h-[500px]">
                <ScrollArea className="h-full pr-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 p-2 md:p-4">
                    {topArtists.map((artist, index) => (
                      <Card
                        key={artist.id}
                        className={`relative group overflow-hidden border-none cursor-pointer transition-all duration-300 py-0 ${
                          selectedArtist?.id === artist.id
                            ? "ring-2 ring-[#1ED760]"
                            : ""
                        } ${
                          hoveredItemId === artist.id
                            ? "scale-105"
                            : "scale-100"
                        }`}
                        onClick={() => setSelectedArtist(artist)}
                        onMouseEnter={() => setHoveredItemId(artist.id)}
                        onMouseLeave={() => setHoveredItemId(null)}
                      >
                        <Badge className="absolute top-2 left-2 z-10 bg-black/60 text-white rounded-full w-5 h-5 md:w-6 md:h-6 p-0 flex items-center justify-center font-bold text-xs">
                          {index + 1}
                        </Badge>

                        {artist.images && artist.images.length > 0 ? (
                          <img
                            src={artist.images[0].url}
                            alt={artist.name}
                            className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full aspect-square bg-[#333] flex items-center justify-center">
                            <span className="text-xl">🎵</span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-3">
                          <h3 className="font-bold text-white line-clamp-1 text-sm md:text-base">
                            {artist.name}
                          </h3>
                          <p className="text-xs text-[#B3B3B3] capitalize">
                            {artist.genres?.slice(0, 2).join(", ") ||
                              "No genres"}
                          </p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Selected Artist Details - Hidden on mobile */}
              <div className="hidden lg:block">
                {selectedArtist && (
                  <Card
                    className="h-[500px] relative overflow-hidden border-none transition-colors duration-500"
                    style={getArtistBackgroundStyle(selectedArtist)}
                  >
                    <div className="absolute inset-0 p-6 flex flex-col">
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-4">
                          <Badge
                            variant="outline"
                            className="bg-black/30 border-none"
                          >
                            ARTIST SPOTLIGHT
                          </Badge>
                          <Link
                            href={`/dashboard/artist/${selectedArtist.id}`}
                            className="bg-black/30 p-2 rounded-full hover:bg-black/50 transition-colors"
                          >
                            <ExternalLink size={14} />
                          </Link>
                        </div>

                        <div className="mt-auto">
                          <h2 className="text-3xl font-bold mb-1">
                            {selectedArtist.name}
                          </h2>
                          <Badge
                            variant="secondary"
                            className="bg-[#1ED760] text-black border-none"
                          >
                            {selectedArtist.followers?.total.toLocaleString()}{" "}
                            followers
                          </Badge>

                          {selectedArtist.genres &&
                            selectedArtist.genres.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-4 mb-4">
                                {selectedArtist.genres
                                  .slice(0, 4)
                                  .map((genre) => (
                                    <Badge
                                      key={genre}
                                      variant="outline"
                                      className="bg-white/10 border-none capitalize"
                                    >
                                      {genre.replace(/-/g, " ")}
                                    </Badge>
                                  ))}
                              </div>
                            )}
                        </div>
                      </div>

                      <div className="mt-auto">
                        <div className="flex items-center gap-3">
                          <Button className="bg-[#1ED760] hover:bg-[#1ED760]/90 text-black">
                            <Play size={18} className="fill-black mr-2" /> Play
                            Top Songs
                          </Button>
                          <Button
                            variant="outline"
                            className="border-white/30 hover:border-white"
                          >
                            <PlusCircle size={18} className="mr-2" /> Follow
                          </Button>
                        </div>

                        <div className="mt-4 text-sm text-[#B3B3B3]">
                          Popularity score:
                          <Progress
                            value={selectedArtist.popularity}
                            className="h-1.5 mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>

              {/* Mobile Artist Detail View */}
              <div className="lg:hidden mt-4">
                {selectedArtist && (
                  <Card
                    className="relative overflow-hidden border-none transition-colors duration-500 h-[250px]"
                    style={getArtistBackgroundStyle(selectedArtist)}
                  >
                    <div className="absolute inset-0 p-4 flex flex-col">
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-1">
                          {selectedArtist.name}
                        </h2>
                        <Badge
                          variant="secondary"
                          className="bg-[#1ED760] text-black border-none"
                        >
                          {selectedArtist.followers?.total.toLocaleString()}{" "}
                          followers
                        </Badge>

                        {/* Compact genre list */}
                        {selectedArtist.genres &&
                          selectedArtist.genres.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {selectedArtist.genres
                                .slice(0, 3)
                                .map((genre) => (
                                  <Badge
                                    key={genre}
                                    variant="outline"
                                    className="bg-white/10 border-none capitalize text-xs"
                                  >
                                    {genre.replace(/-/g, " ")}
                                  </Badge>
                                ))}
                            </div>
                          )}
                      </div>

                      <div className="mt-auto">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className="bg-[#1ED760] hover:bg-[#1ED760]/90 text-black"
                          >
                            <Play size={16} className="fill-black mr-1" /> Play
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/30 hover:border-white"
                          >
                            <PlusCircle size={16} className="mr-1" /> Follow
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="ml-auto"
                            asChild
                          >
                            <Link
                              href={`/dashboard/artist/${selectedArtist.id}`}
                            >
                              <ExternalLink size={16} />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Tracks Tab Content */}
          <TabsContent value="tracks" className="mt-0 space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {topTracks.slice(0, 2).map((track, index) => (
                <Card
                  key={track.id}
                  className="relative overflow-hidden bg-gradient-to-br from-[#333] to-[#1E1E1E] border-none hover:shadow-xl transition-all duration-300"
                  onMouseEnter={() => setHoveredItemId(track.id)}
                  onMouseLeave={() => setHoveredItemId(null)}
                >
                  <CardContent className="p-3 md:p-5">
                    <div className="flex">
                      <div className="relative min-w-[80px] h-[80px] md:min-w-[120px] md:h-[120px] mr-3 md:mr-5">
                        <img
                          src={
                            track.album.images?.[0]?.url || "/placeholder.png"
                          }
                          alt={track.name}
                          className="w-full h-full object-cover rounded-md shadow-lg"
                        />
                        <div
                          className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-300 ${
                            hoveredItemId === track.id
                              ? "opacity-100"
                              : "opacity-0"
                          }`}
                        >
                          <Button className="bg-[#1ED760] hover:bg-[#1ED760]/90 rounded-full h-8 w-8 md:h-12 md:w-12 p-0">
                            <Play
                              size={isMobile ? 16 : 24}
                              className="fill-black"
                            />
                          </Button>
                        </div>
                        <Badge className="absolute top-0 left-0 bg-[#121212]/80 text-white border-none text-xs">
                          #{index + 1}
                        </Badge>
                      </div>

                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/dashboard/track/${track.id}`}
                          className="text-base md:text-xl font-bold hover:underline line-clamp-1"
                        >
                          {track.name}
                        </Link>
                        <Link
                          href={`/dashboard/artist/${track.artists[0].id}`}
                          className="text-sm text-[#B3B3B3] hover:text-[#1ED760] transition-colors"
                        >
                          {track.artists.map((a) => a.name).join(", ")}
                        </Link>

                        <div className="flex items-center gap-2 mt-3 text-xs md:text-sm">
                          <div className="flex items-center text-[#B3B3B3]">
                            <Clock size={14} className="mr-1" />
                            {Math.floor(track.duration_ms / 60000)}:
                            {((track.duration_ms % 60000) / 1000)
                              .toFixed(0)
                              .padStart(2, "0")}
                          </div>
                          <Separator
                            orientation="vertical"
                            className="h-3 bg-[#B3B3B3]"
                          />
                          <div className="text-[#B3B3B3] truncate">
                            {track.album.name}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Track List Table - Hidden on mobile */}
            <div className="hidden md:block bg-[#121212] rounded-xl overflow-hidden">
              <Table>
                <TableHeader className="bg-[#232323]">
                  <TableRow>
                    <TableHead className="w-[60px] text-[#B3B3B3]">#</TableHead>
                    <TableHead className="text-[#B3B3B3]">Track</TableHead>
                    <TableHead className="text-[#B3B3B3]">Album</TableHead>
                    <TableHead className="flex justify-center items-center text-[#B3B3B3]">
                      <Clock size={16} />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topTracks.slice(2).map((track, index) => (
                    <TableRow
                      key={track.id}
                      className={`border-b border-[#333] hover:bg-white/5 ${
                        hoveredItemId === track.id ? "bg-white/5" : ""
                      }`}
                      onMouseEnter={() => setHoveredItemId(track.id)}
                      onMouseLeave={() => setHoveredItemId(null)}
                    >
                      <TableCell className="text-[#B3B3B3]">
                        {index + 3}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="relative w-10 h-10 mr-3 flex-shrink-0">
                            <img
                              src={
                                track.album.images?.[0]?.url ||
                                "/placeholder.png"
                              }
                              alt={track.name}
                              className="w-full h-full object-cover rounded"
                            />
                            {hoveredItemId === track.id && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <Play size={16} className="fill-white" />
                              </div>
                            )}
                          </div>
                          <div>
                            <HoverCard>
                              <HoverCardTrigger asChild>
                                <Link
                                  href={`/dashboard/track/${track.id}`}
                                  className="font-medium hover:underline"
                                >
                                  {track.name}
                                </Link>
                              </HoverCardTrigger>
                              <HoverCardContent className="w-80 bg-[#282828] border-none">
                                <div className="flex">
                                  <img
                                    src={
                                      track.album.images?.[0]?.url ||
                                      "/placeholder.png"
                                    }
                                    alt={track.name}
                                    className="w-16 h-16 object-cover rounded mr-3"
                                  />
                                  <div>
                                    <h4 className="font-bold">{track.name}</h4>
                                    <p className="text-sm text-[#B3B3B3]">
                                      {track.artists
                                        .map((a) => a.name)
                                        .join(", ")}
                                    </p>
                                    <p className="text-xs text-[#B3B3B3] mt-1">
                                      {track.album.name} •{" "}
                                      {track.album.release_date?.split("-")[0]}
                                    </p>
                                  </div>
                                </div>
                              </HoverCardContent>
                            </HoverCard>
                            <div>
                              <Link
                                href={`/dashboard/artist/${track.artists[0].id}`}
                                className="text-sm text-[#B3B3B3] hover:text-[#1ED760] transition-colors"
                              >
                                {track.artists.map((a) => a.name).join(", ")}
                              </Link>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-[#B3B3B3]">
                        <span className="line-clamp-1">{track.album.name}</span>
                      </TableCell>
                      <TableCell className="text-center text-[#B3B3B3]">
                        {Math.floor(track.duration_ms / 60000)}:
                        {((track.duration_ms % 60000) / 1000)
                          .toFixed(0)
                          .padStart(2, "0")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Track List Cards */}
            <div className="md:hidden space-y-3">
              {topTracks.slice(2).map((track, index) => (
                <div
                  key={track.id}
                  className={`bg-[#1E1E1E] rounded-lg p-3 ${
                    hoveredItemId === track.id ? "bg-[#282828]" : ""
                  }`}
                  onMouseEnter={() => setHoveredItemId(track.id)}
                  onMouseLeave={() => setHoveredItemId(null)}
                >
                  <div className="flex items-center">
                    <div className="text-[#B3B3B3] w-6 text-center text-sm">
                      {index + 3}
                    </div>
                    <div className="relative w-10 h-10 mr-3 flex-shrink-0">
                      <img
                        src={track.album.images?.[0]?.url || "/placeholder.png"}
                        alt={track.name}
                        className="w-full h-full object-cover rounded"
                      />
                      {hoveredItemId === track.id && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Play size={16} className="fill-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/dashboard/track/${track.id}`}
                        className="font-medium text-sm hover:underline line-clamp-1"
                      >
                        {track.name}
                      </Link>
                      <Link
                        href={`/dashboard/artist/${track.artists[0].id}`}
                        className="text-xs text-[#B3B3B3] hover:text-[#1ED760] transition-colors line-clamp-1"
                      >
                        {track.artists.map((a) => a.name).join(", ")}
                      </Link>
                    </div>
                    <div className="text-right text-xs text-[#B3B3B3] ml-2">
                      {Math.floor(track.duration_ms / 60000)}:
                      {((track.duration_ms % 60000) / 1000)
                        .toFixed(0)
                        .padStart(2, "0")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
