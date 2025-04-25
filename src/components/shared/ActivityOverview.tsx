// src/components/dashboard/ActivityOverview.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import {
  Clock,
  Headphones,
  Calendar,
  Music,
  Disc,
  BarChart,
  ChevronRight,
} from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Link from "next/link";

interface ActivityStats {
  recentTracks: {
    count: number;
    uniqueArtists: number;
    topGenres: string[];
    mostActive: {
      day: string;
      count: number;
    };
    recentlyPlayed: {
      id: string;
      name: string;
      artist: string;
      artistId: string;
      imageUrl: string;
      playedAt: string;
    }[];
  };
}

export function ActivityOverview() {
  const { spotifyClient } = useAuth();
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivityData = async () => {
      if (!spotifyClient) return;

      setIsLoading(true);
      try {
        // Get the last 50 recently played tracks
        const recentlyPlayed =
          await spotifyClient.player.getRecentlyPlayedTracks(50);

        // Process recently played tracks
        const tracks = recentlyPlayed.items;

        // Extract unique artist IDs for genre lookup
        const uniqueArtistIds = Array.from(
          new Set(tracks.map((item) => item.track.artists[0].id))
        );

        // Batch artist IDs (max 50 per request)
        const artistBatches = [];
        for (let i = 0; i < uniqueArtistIds.length; i += 50) {
          artistBatches.push(uniqueArtistIds.slice(i, i + 50));
        }

        // Fetch artist details including genres
        const artistsWithGenres = [];
        for (const batch of artistBatches) {
          const response = await spotifyClient.artists.get(batch);
          artistsWithGenres.push(...response);
        }

        // Create a map of artist IDs to their genres
        const artistGenreMap = new Map<string, string[]>();
        artistsWithGenres.forEach((artist) => {
          artistGenreMap.set(artist.id, artist.genres);
        });

        // Count genre occurrences
        const genreCounts: Record<string, number> = {};
        tracks.forEach((item) => {
          const artistId = item.track.artists[0].id;
          const genres = artistGenreMap.get(artistId) || [];

          genres.forEach((genre) => {
            genreCounts[genre] = (genreCounts[genre] || 0) + 1;
          });
        });

        // Get top 3 genres
        const topGenres = Object.entries(genreCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([genre]) => genre);

        // Get play counts by day
        const playsByDay = tracks.reduce((acc, item) => {
          const day = new Date(item.played_at).toLocaleDateString(undefined, {
            weekday: "long",
          });
          acc[day] = (acc[day] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // Find most active day
        const mostActiveDay = Object.entries(playsByDay).sort(
          (a, b) => b[1] - a[1]
        )[0] || ["Unknown", 0];

        // Get details for recently played tracks
        const recentTracksWithDetails = tracks.slice(0, 5).map((item) => ({
          id: item.track.id,
          name: item.track.name,
          artist: item.track.artists[0].name,
          artistId: item.track.artists[0].id,
          imageUrl: item.track.album.images?.[0]?.url || "",
          playedAt: new Date(item.played_at).toLocaleString(),
        }));

        setStats({
          recentTracks: {
            count: tracks.length,
            uniqueArtists: uniqueArtistIds.length,
            topGenres: topGenres.length > 0 ? topGenres : ["No genres found"],
            mostActive: {
              day: mostActiveDay[0],
              count: mostActiveDay[1],
            },
            recentlyPlayed: recentTracksWithDetails,
          },
        });
      } catch (error) {
        console.error("Error fetching activity data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivityData();
  }, [spotifyClient]);

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center bg-[#282828] rounded-lg">
        <div className="flex flex-col items-center">
          <div className="animate-pulse w-10 h-10 rounded-full bg-[#1ED760] mb-4"></div>
          <p className="text-[#B3B3B3]">Analyzing your music...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-[#282828] rounded-lg p-6 text-center">
        <p className="text-[#B3B3B3]">
          No recent activity found. Start listening to see your stats!
        </p>
      </div>
    );
  }

  const { recentTracks } = stats;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Recent Activity</h2>
        <Link
          href="/dashboard/insights"
          className="flex items-center text-sm text-[#1ED760] hover:underline"
        >
          View detailed insights <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </div>

      {/* Scrollable Stats Cards Container */}
      <div className="relative">
        <ScrollArea className="pb-4 w-full">
          <div className="flex space-x-4 w-max min-w-full">
            <div className="bg-gradient-to-br from-[#3E3E3E] to-[#282828] p-5 rounded-lg flex items-center min-w-[240px]">
              <div className="bg-[#1ED760] p-3 rounded-full mr-4">
                <Headphones className="h-6 w-6 text-black" />
              </div>
              <div>
                <p className="text-sm text-[#B3B3B3]">Tracks Played</p>
                <p className="text-2xl font-bold">{recentTracks.count}</p>
                <p className="text-xs text-[#B3B3B3]">in the last 7 days</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#3E3E3E] to-[#282828] p-5 rounded-lg flex items-center min-w-[240px]">
              <div className="bg-[#1DB954] p-3 rounded-full mr-4">
                <Music className="h-6 w-6 text-black" />
              </div>
              <div>
                <p className="text-sm text-[#B3B3B3]">Unique Artists</p>
                <p className="text-2xl font-bold">
                  {recentTracks.uniqueArtists}
                </p>
                <p className="text-xs text-[#B3B3B3]">diverse listening</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#3E3E3E] to-[#282828] p-5 rounded-lg flex items-center min-w-[240px]">
              <div className="bg-[#1AB34D] p-3 rounded-full mr-4">
                <Calendar className="h-6 w-6 text-black" />
              </div>
              <div>
                <p className="text-sm text-[#B3B3B3]">Most Active Day</p>
                <p className="text-xl font-bold">
                  {recentTracks.mostActive.day}
                </p>
                <p className="text-xs text-[#B3B3B3]">
                  {recentTracks.mostActive.count} tracks played
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#3E3E3E] to-[#282828] p-5 rounded-lg flex items-center min-w-[240px]">
              <div className="bg-[#19A945] p-3 rounded-full mr-4">
                <Disc className="h-6 w-6 text-black" />
              </div>
              <div>
                <p className="text-sm text-[#B3B3B3]">Top Genre</p>
                <p className="text-xl font-bold capitalize truncate max-w-[160px]">
                  {recentTracks.topGenres[0]?.replace(/-/g, " ")}
                </p>
                {recentTracks.topGenres.length > 1 && (
                  <p className="text-xs text-[#B3B3B3] capitalize truncate max-w-[160px]">
                    Also:{" "}
                    {recentTracks.topGenres
                      .slice(1, 3)
                      .map((g) => g.replace(/-/g, " "))
                      .join(", ")}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#3E3E3E] to-[#282828] p-5 rounded-lg flex items-center min-w-[240px]">
              <div className="bg-[#18A040] p-3 rounded-full mr-4">
                <BarChart className="h-6 w-6 text-black" />
              </div>
              <div>
                <p className="text-sm text-[#B3B3B3]">Listening Pattern</p>
                <p className="text-xl font-bold">
                  {recentTracks.count > 20
                    ? "Active"
                    : recentTracks.count > 10
                    ? "Moderate"
                    : "Light"}
                </p>
                <p className="text-xs text-[#B3B3B3]">based on recent plays</p>
              </div>
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Recently Played Track Timeline */}
      <div className="bg-[#282828] rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Recently Played
        </h3>
        <div className="space-y-4">
          {recentTracks.recentlyPlayed.map((track, index) => (
            <div
              key={index}
              className="flex items-center bg-[#333333] p-3 rounded-md hover:bg-[#3a3a3a] transition-colors"
            >
              <div className="relative flex-shrink-0">
                <img
                  src={track.imageUrl || "/placeholder.png"}
                  alt={track.name}
                  className="w-12 h-12 rounded"
                />
                <div className="absolute -top-2 -right-2 bg-[#1ED760] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {index + 1}
                </div>
              </div>
              <div className="flex-1 min-w-0 ml-4">
                <Link
                  href={`/dashboard/track/${track.id}`}
                  className="font-medium text-white truncate block hover:underline"
                >
                  {track.name}
                </Link>
                <Link
                  href={`/dashboard/artist/${track.artistId}`}
                  className="text-sm text-[#B3B3B3] hover:text-[#1ED760] truncate inline-block"
                >
                  {track.artist}
                </Link>
              </div>
              <div className="text-xs text-[#B3B3B3] ml-4 text-right whitespace-nowrap">
                {new Date(track.playedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link
            href="/dashboard/history"
            className="inline-flex items-center text-sm text-[#1ED760] hover:underline"
          >
            View your full listening history
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
