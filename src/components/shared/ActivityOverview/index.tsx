// src/components/shared/ActivityOverview/index.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useIsMobile } from "@/hooks/use-responsive";
import { StatCards } from "./StatCards";
import { RecentTracksList } from "./RecentTracksList";

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
  const isMobile = useIsMobile();

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
          playedAt: item.played_at,
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
    return <LoadingState />;
  }

  if (!stats) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <SectionHeader
        title="Your Recent Activity"
        linkText={isMobile ? "View insights" : "View detailed insights"}
        linkHref="/dashboard/insights"
      />

      <StatCards stats={stats.recentTracks} />
      <RecentTracksList tracks={stats.recentTracks.recentlyPlayed} />
    </div>
  );
}

// Sub-components for ActivityOverview
function LoadingState() {
  return (
    <div className="h-48 md:h-64 flex items-center justify-center bg-[#282828] rounded-lg">
      <div className="flex flex-col items-center">
        <div className="animate-pulse w-8 md:w-10 h-8 md:h-10 rounded-full bg-[#1ED760] mb-4"></div>
        <p className="text-[#B3B3B3]">Analyzing your music...</p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-[#282828] rounded-lg p-4 md:p-6 text-center">
      <p className="text-[#B3B3B3]">
        No recent activity found. Start listening to see your stats!
      </p>
    </div>
  );
}

function SectionHeader({
  title,
  linkText,
  linkHref,
}: {
  title: string;
  linkText: string;
  linkHref: string;
}) {
  return (
    <div className="flex justify-between items-center flex-wrap gap-2">
      <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
      <Link
        href={linkHref}
        className="flex items-center text-sm text-[#1ED760] hover:underline"
      >
        {linkText} <ChevronRight className="h-4 w-4 ml-1" />
      </Link>
    </div>
  );
}
