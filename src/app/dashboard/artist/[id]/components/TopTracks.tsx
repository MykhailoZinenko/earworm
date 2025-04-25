"use client";

import { useEffect, useState } from "react";
import { Track } from "@spotify/web-api-ts-sdk";
import { Heart, Clock, Star, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/app/context/AuthContext";
import { toast } from "sonner";

interface TopTracksProps {
  tracks: Track[];
  userTopTracks: Track[];
  dominantColor: string;
}

export function TopTracks({
  tracks,
  userTopTracks,
  dominantColor,
}: TopTracksProps) {
  const { spotifyClient } = useAuth();
  const [savedTracks, setSavedTracks] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
    {}
  );

  // Function to format duration from ms to MM:SS
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, "0")}`;
  };

  // Check if a track is in user's top tracks
  const isInUserTopTracks = (trackId: string) => {
    return userTopTracks.some((track) => track.id === trackId);
  };

  // Get the rank of a track in user's top tracks if present
  const getUserTrackRank = (trackId: string) => {
    const index = userTopTracks.findIndex((track) => track.id === trackId);
    return index !== -1 ? index + 1 : null;
  };

  // Check which tracks are saved in user's library
  useEffect(() => {
    const checkSavedTracks = async () => {
      if (!spotifyClient || tracks.length === 0) return;

      setIsLoading(true);
      try {
        // Split into batches of 50 (Spotify API limit)
        const trackIds = tracks.map((track) => track.id);
        const results: boolean[] = [];

        // Process in batches of 50
        for (let i = 0; i < trackIds.length; i += 50) {
          const batch = trackIds.slice(i, i + 50);
          const batchResults =
            await spotifyClient.currentUser.tracks.hasSavedTracks(batch);
          results.push(...batchResults);
        }

        // Create a map of track ID to saved status
        const savedMap: Record<string, boolean> = {};
        tracks.forEach((track, index) => {
          savedMap[track.id] = results[index] || false;
        });

        setSavedTracks(savedMap);
      } catch (error) {
        console.error("Error checking saved tracks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSavedTracks();
  }, [tracks, spotifyClient]);

  // Toggle save/unsave track
  const handleToggleSave = async (trackId: string) => {
    if (!spotifyClient) return;

    setActionLoading((prev) => ({ ...prev, [trackId]: true }));

    try {
      const isSaved = savedTracks[trackId];

      if (isSaved) {
        //ts-ignore
        await spotifyClient.currentUser.tracks.removeSavedTracks({
          ids: [trackId],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
        toast.success("Removed from your Liked Songs");
      } else {
        await spotifyClient.currentUser.tracks.saveTracks({
          ids: [trackId],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
        toast.success("Added to your Liked Songs");
      }

      // Update local state
      setSavedTracks((prev) => ({
        ...prev,
        [trackId]: !isSaved,
      }));
    } catch (error) {
      console.error(
        `Error ${
          savedTracks[trackId] ? "removing from" : "saving to"
        } library:`,
        error
      );
      toast.error(
        `Failed to ${savedTracks[trackId] ? "remove" : "save"} track`
      );
    } finally {
      setActionLoading((prev) => ({ ...prev, [trackId]: false }));
    }
  };

  // Create custom hover color based on dominant color
  const hoverStyle = {
    "--hover-bg": `${dominantColor}22`,
  } as React.CSSProperties;

  return (
    <div style={hoverStyle}>
      <ScrollArea className="h-[540px] pr-4">
        <Table>
          <TableHeader className="border-b border-white/10">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12 text-left font-normal text-white/60 pb-3">
                #
              </TableHead>
              <TableHead className="text-left font-normal text-white/60 pb-3">
                Title
              </TableHead>
              <TableHead className="text-right font-normal text-white/60 pb-3 text-center hidden sm:table-cell">
                Popularity
              </TableHead>
              <TableHead className="text-right font-normal text-white/60 pb-3 w-20">
                <Clock size={16} className="mx-auto" />
              </TableHead>
              <TableHead className="text-center font-normal text-white/60 pb-3 w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tracks.map((track, index) => {
              const rank = getUserTrackRank(track.id);
              const inUserTop = isInUserTopTracks(track.id);
              const isSaved = savedTracks[track.id] || false;
              const isActionLoading = actionLoading[track.id] || false;

              return (
                <TableRow
                  key={track.id}
                  className={`transition-colors border-b border-white/5 hover:bg-[var(--hover-bg)] data-[state=selected]:bg-[var(--hover-bg)]`}
                >
                  <TableCell className="py-3 px-2">
                    <span className="text-white/60 font-medium">
                      {index + 1}
                    </span>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative min-w-10 h-10 rounded overflow-hidden bg-white/5">
                        <img
                          src={
                            track.album.images?.[0]?.url || "/placeholder.png"
                          }
                          alt={track.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/dashboard/track/${track.id}`}
                          className="text-white font-medium hover:underline line-clamp-1"
                        >
                          {track.name}
                        </Link>

                        <div className="flex items-center gap-2">
                          {inUserTop && (
                            <Badge className="h-4 bg-[#1ED760]/20 text-[#1ED760] border-none text-[10px] px-1">
                              <Star size={10} className="mr-0.5" />
                              {rank && rank <= 20 ? `#${rank}` : "TOP"}
                            </Badge>
                          )}

                          <Link
                            href={`/dashboard/album/${track.album.id}`}
                            className="text-xs text-white/60 hover:text-white/80 hover:underline line-clamp-1"
                          >
                            {track.album.name}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 pr-4 text-right hidden sm:table-cell">
                    <div className="flex items-center justify-center">
                      <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#1ED760]"
                          style={{ width: `${track.popularity}%` }}
                        />
                      </div>
                      <span className="text-xs text-white/60 ml-2">
                        {track.popularity}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 pr-4 text-center text-white/60 text-sm">
                    {formatDuration(track.duration_ms)}
                  </TableCell>
                  <TableCell className="py-3 pr-2 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isLoading || isActionLoading}
                      onClick={() => handleToggleSave(track.id)}
                      className={`text-white hover:bg-white/10 cursor-pointer ${
                        isSaved ? "text-[#1ED760]" : "text-white/70"
                      }`}
                    >
                      {isActionLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Heart size={16} fill={isSaved ? "#1ED760" : "none"} />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
