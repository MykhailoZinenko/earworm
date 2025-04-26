"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { Artist, Track, SimplifiedAlbum } from "@spotify/web-api-ts-sdk";
import {
  ArtistSimilarityScore,
  findRelatedArtists,
} from "@/lib/artist-recommendation";
import { extractColors } from "@/lib/color-utils";
import { ArtistHeader } from "./components/ArtistHeader";
import { TopTracks } from "./components/TopTracks";
import { ArtistAlbums } from "./components/ArtistAlbums";
import { ArtistStats } from "./components/ArtistStats";
import { RelatedArtists } from "./components/RelatedArtists";
import { ListeningHistory } from "./components/ListeningHistory";
import { ListeningInsights } from "./components/ListeningInsights";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export type Source = "recent" | "short_term" | "medium_term" | "long_term";

export type TrackHistoryItem = {
  track: Track;
  source: Source;
  played_at?: string;
};

export type ListenData = {
  rankInTopArtists: number | null;
  totalListensMs: number;
  listenTrend?: "rising" | "falling" | "steady";
  topTimeOfDay?: string;
  favoriteTrackId?: string;
  trackHistory?: TrackHistoryItem[];
};

export default function ArtistPage() {
  const { id } = useParams() as { id: string };
  const { spotifyClient, currentSession } = useAuth();
  const router = useRouter();

  const [artist, setArtist] = useState<Artist | null>(null);
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<SimplifiedAlbum[]>([]);
  const [singles, setSingles] = useState<SimplifiedAlbum[]>([]);
  const [compilations, setCompilations] = useState<SimplifiedAlbum[]>([]);
  const [relatedArtistsWithScores, setRelatedArtistsWithScores] = useState<
    ArtistSimilarityScore[]
  >([]);
  const [userTopTracks, setUserTopTracks] = useState<Track[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<
    {
      track: Track;
      played_at: string;
    }[]
  >([]);
  const [dominantColor, setDominantColor] = useState<string>("#1ED760"); // Default to Spotify green
  const [textColor, setTextColor] = useState<string>("#FFFFFF");
  const [isFollowing, setIsFollowing] = useState(false);
  const [listenData, setListenData] = useState<ListenData>({
    rankInTopArtists: null,
    totalListensMs: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract colors from artist image to create a cohesive theme
  useEffect(() => {
    const extractThemeColors = async () => {
      if (artist?.images && artist.images.length > 0) {
        try {
          const { dominant, isLight } = await extractColors(
            artist.images[0].url
          );

          // Additional contrast check - ensure the color is bright enough
          const brightenedColor = ensureMinimumBrightness(dominant);

          setDominantColor(brightenedColor);
          setTextColor(isLight ? "#121212" : "#FFFFFF");
        } catch (error) {
          console.error("Error extracting colors:", error);
          // Fallback to bright Spotify green if color extraction fails
          setDominantColor("#1ED760");
          setTextColor("#FFFFFF");
        }
      }
    };

    extractThemeColors();
  }, [artist]);

  // Ensure minimum brightness for the dominant color
  const ensureMinimumBrightness = (color: string): string => {
    // Convert hex to RGB
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    // Calculate brightness
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // If brightness is too low, increase it
    if (brightness < 128) {
      const factor = 128 / brightness;
      const newR = Math.min(255, Math.round(r * factor));
      const newG = Math.min(255, Math.round(g * factor));
      const newB = Math.min(255, Math.round(b * factor));

      return `#${newR.toString(16).padStart(2, "0")}${newG
        .toString(16)
        .padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
    }

    return color;
  };

  // CSS variables for dynamic theming based on artist colors
  const themeStyle = useMemo(() => {
    return {
      "--artist-primary": dominantColor,
      "--artist-text": textColor,
      "--artist-secondary": adjustColorBrightness(dominantColor, -30),
      "--artist-tertiary": adjustColorOpacity(dominantColor, 0.1),
      "--artist-accent": adjustColorBrightness(dominantColor, 20),
      "--artist-hover": adjustColorOpacity(dominantColor, 0.2),
      "--artist-progress": dominantColor,
      "--artist-gradient-start": adjustColorOpacity(dominantColor, 0.2),
      "--artist-gradient-end": adjustColorOpacity(dominantColor, 0.05),
    } as React.CSSProperties;
  }, [dominantColor, textColor]);

  // Fetch all artist data
  useEffect(() => {
    const fetchData = async () => {
      if (!spotifyClient) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch multiple data sources in parallel for efficiency
        const [
          artistData,
          topTracksData,
          albumsData,
          followingData,
          recentlyPlayedData,
          userTopTracksShortTerm,
          userTopTracksMediumTerm,
          userTopTracksLongTerm,
          userTopArtistsData,
        ] = await Promise.all([
          spotifyClient.artists.get(id),
          spotifyClient.artists.topTracks(id, "US"),
          spotifyClient.artists.albums(id, "album,single,appears_on", "US", 50),
          spotifyClient.currentUser.followsArtistsOrUsers([id], "artist"),
          spotifyClient.player.getRecentlyPlayedTracks(50),
          spotifyClient.currentUser.topItems("tracks", "short_term", 50),
          spotifyClient.currentUser.topItems("tracks", "medium_term", 50),
          spotifyClient.currentUser.topItems("tracks", "long_term", 50),
          spotifyClient.currentUser.topItems("artists", "short_term", 50),
        ]);

        // Check if the artist appears in user's top artists list
        let artistRank: number | null = null;

        // First check in the initial top 50 artists
        const artistIndex = userTopArtistsData.items.findIndex(
          (topArtist) => topArtist.id === id
        );

        if (artistIndex !== -1) {
          artistRank = artistIndex + 1;
        } else {
          // If not found in top 50, check the next 50
          const nextTopArtists = await spotifyClient.currentUser.topItems(
            "artists",
            "short_term",
            50,
            50 // offset
          );

          const nextArtistIndex = nextTopArtists.items.findIndex(
            (topArtist) => topArtist.id === id
          );

          if (nextArtistIndex !== -1) {
            artistRank = 50 + nextArtistIndex + 1;
          }
          // If still not found, artistRank remains null
        }

        setArtist(artistData);
        setTopTracks(topTracksData.tracks);
        setIsFollowing(followingData[0]);
        setUserTopTracks([
          ...userTopTracksShortTerm.items,
          ...userTopTracksMediumTerm.items,
          ...userTopTracksLongTerm.items,
        ]);

        // Filter artist's recently played tracks
        const artistRecentlyPlayed = recentlyPlayedData.items.filter((item) =>
          item.track.artists.some((artist) => artist.id === id)
        );
        setRecentlyPlayed(artistRecentlyPlayed);

        // Process albums by type
        const albums = albumsData.items;
        setAlbums(albums.filter((album) => album.album_type === "album"));
        setSingles(albums.filter((album) => album.album_type === "single"));
        setCompilations(
          albums.filter((album) => album.album_type === "compilation")
        );

        // Calculate listen data from top tracks and recently played
        const listenInfo = calculateListenData(
          id,
          userTopTracksShortTerm.items,
          userTopTracksMediumTerm.items,
          userTopTracksLongTerm.items,
          recentlyPlayedData.items,
          artistRecentlyPlayed,
          artistRank // Pass the actual artist rank
        );

        setListenData(listenInfo);

        // Use our algorithm to find similar artists
        const similarArtistsResults = await findRelatedArtists(
          spotifyClient,
          artistData,
          userTopArtistsData.items,
          [
            ...userTopTracksShortTerm.items,
            ...userTopTracksMediumTerm.items,
            ...userTopTracksLongTerm.items,
          ],
          recentlyPlayedData.items
        );

        setRelatedArtistsWithScores(similarArtistsResults);
      } catch (err) {
        console.error("Error fetching artist data:", err);
        setError("Failed to load artist information. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, spotifyClient, currentSession?.user.country]);

  // Toggle follow/unfollow artist
  const handleToggleFollow = async () => {
    if (!spotifyClient || !artist) return;

    try {
      if (isFollowing) {
        await spotifyClient.currentUser.unfollowArtistsOrUsers(
          [artist.id],
          "artist"
        );
      } else {
        await spotifyClient.currentUser.followArtistsOrUsers(
          [artist.id],
          "artist"
        );
      }
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error("Error toggling follow status:", err);
    }
  };

  // Go back to previous page
  const handleBack = () => {
    router.back();
  };

  // Share artist
  const handleShare = () => {
    if (!artist) return;

    try {
      // Try the modern Clipboard API first
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("Failed to copy link");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-t-[#1ED760] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        <p className="mt-6 text-[#B3B3B3]">Loading artist information...</p>
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="bg-[#282828] p-8 rounded-xl max-w-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <p className="text-[#B3B3B3] mb-6">
            {error ||
              "Artist not found. They may not be available in your region."}
          </p>
          <Button
            onClick={handleBack}
            variant="default"
            className="bg-[#1ED760] text-black hover:bg-[#1ED760]/90"
          >
            <ArrowLeft className="mr-2" size={16} />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 @container" style={themeStyle}>
      {/* Gradient overlay using the dominant color */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20 z-0"
        style={{
          background: `radial-gradient(circle at top, ${dominantColor}30 0%, transparent 50%)`,
        }}
      />

      {/* Artist Header */}
      <ArtistHeader
        artist={artist}
        isFollowing={isFollowing}
        onToggleFollow={handleToggleFollow}
        onBack={handleBack}
        onShare={handleShare}
        listenData={listenData}
        dominantColor={dominantColor}
      />

      {/* Main Content */}
      <div className="px-4 md:px-8 xl:px-12 mt-4 md:mt-8 relative z-10">
        <div className="grid grid-cols-1 2xl:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="xl:col-span-2 space-y-8">
            {/* Top Tracks */}
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span
                  className="w-1 h-6 rounded-full inline-block transition-colors"
                  style={{ backgroundColor: dominantColor }}
                ></span>
                Top Songs
              </h2>
              <TopTracks
                tracks={topTracks}
                userTopTracks={userTopTracks}
                dominantColor={dominantColor}
              />
            </section>

            {/* Discography */}
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span
                  className="w-1 h-6 rounded-full inline-block transition-colors"
                  style={{ backgroundColor: dominantColor }}
                ></span>
                Discography
              </h2>

              <Tabs defaultValue="albums" className="w-full">
                <TabsList className="mb-4 bg-black/20 backdrop-blur-sm w-full justify-start border-b border-white/10 rounded-none p-0 h-auto">
                  <TabsTrigger
                    value="albums"
                    className="rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=active]:border-[var(--artist-primary)] data-[state=active]:bg-transparent py-3 text-sm"
                  >
                    Albums ({albums.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="singles"
                    className="rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=active]:border-[var(--artist-primary)] data-[state=active]:bg-transparent py-3 text-sm"
                  >
                    Singles & EPs ({singles.length})
                  </TabsTrigger>
                  {compilations.length > 0 && (
                    <TabsTrigger
                      value="compilations"
                      className="rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=active]:border-[var(--artist-primary)] data-[state=active]:bg-transparent py-3 text-sm"
                    >
                      Compilations ({compilations.length})
                    </TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="albums">
                  <ArtistAlbums albums={albums} dominantColor={dominantColor} />
                </TabsContent>

                <TabsContent value="singles">
                  <ArtistAlbums
                    albums={singles}
                    dominantColor={dominantColor}
                  />
                </TabsContent>

                {compilations.length > 0 && (
                  <TabsContent value="compilations">
                    <ArtistAlbums
                      albums={compilations}
                      dominantColor={dominantColor}
                    />
                  </TabsContent>
                )}
              </Tabs>
            </section>

            {/* User Listening Info */}
            {listenData.trackHistory && listenData.trackHistory.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <span
                    className="w-1 h-6 rounded-full inline-block transition-colors"
                    style={{ backgroundColor: dominantColor }}
                  ></span>
                  Your History with {artist.name}
                </h2>
                <ListeningHistory
                  recentlyPlayed={recentlyPlayed}
                  listenData={listenData}
                  dominantColor={dominantColor}
                />
              </section>
            )}
          </div>

          {/* Right Column - Stats & Related */}
          <div className="space-y-8 xl:col-span-2 2xl:col-span-1">
            {/* Artist Stats */}
            <section
              className="rounded-xl p-6"
              style={{
                background: `linear-gradient(135deg, ${adjustColorOpacity(
                  dominantColor,
                  0.1
                )}, ${adjustColorOpacity(dominantColor, 0.05)})`,
                backdropFilter: "blur(10px)",
              }}
            >
              <h2 className="text-xl font-bold mb-4">Artist Stats</h2>
              <ArtistStats
                artist={artist}
                listenData={listenData}
                dominantColor={dominantColor}
              />
            </section>

            {/* Listening Insights */}
            {listenData.rankInTopArtists && (
              <section
                className="rounded-xl p-6"
                style={{
                  background: `linear-gradient(135deg, ${adjustColorOpacity(
                    dominantColor,
                    0.1
                  )}, ${adjustColorOpacity(dominantColor, 0.05)})`,
                  backdropFilter: "blur(10px)",
                }}
              >
                <h2 className="text-xl font-bold mb-4">
                  Your Listening Insights
                </h2>
                <ListeningInsights
                  listenData={listenData}
                  artist={artist}
                  dominantColor={dominantColor}
                />
              </section>
            )}

            {/* Similar Artists */}
            <section
              className="rounded-xl p-6"
              style={{
                background: `linear-gradient(135deg, ${adjustColorOpacity(
                  dominantColor,
                  0.1
                )}, ${adjustColorOpacity(dominantColor, 0.05)})`,
                backdropFilter: "blur(10px)",
              }}
            >
              <h2 className="text-xl font-bold mb-4">Similar Artists</h2>
              <RelatedArtists
                similarArtists={relatedArtistsWithScores}
                dominantColor={dominantColor}
              />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to calculate user's listening data
function calculateListenData(
  artistId: string,
  topTracksShort: Track[],
  topTracksMedium: Track[],
  topTracksLong: Track[],
  allRecentlyPlayed: { track: Track; played_at: string }[],
  artistRecentlyPlayed: { track: Track; played_at: string }[],
  artistRank: number | null // Pass the actual rank from top artists
): ListenData {
  let favoriteTrackId: string | undefined;
  let totalListensMs = 0;
  let listenTrend: "rising" | "falling" | "steady" = "steady";

  // Find artist tracks in user's top tracks across all time ranges
  const artistInShortTerm = topTracksShort.filter((track) =>
    track.artists.some((artist) => artist.id === artistId)
  );

  const artistInMediumTerm = topTracksMedium.filter((track) =>
    track.artists.some((artist) => artist.id === artistId)
  );

  const artistInLongTerm = topTracksLong.filter((track) =>
    track.artists.some((artist) => artist.id === artistId)
  );

  // Create comprehensive track history by combining recently played and top tracks
  const trackHistory: TrackHistoryItem[] = [
    // Include recently played tracks with actual timestamps
    ...artistRecentlyPlayed.map((item) => ({
      track: item.track,
      source: "recent" as Source,
      played_at: item.played_at,
    })),

    // Include short term top tracks
    ...artistInShortTerm
      .filter(
        (track) =>
          !artistRecentlyPlayed.some((item) => item.track.id === track.id)
      )
      .map((track) => ({
        track,
        source: "short_term" as Source,
      })),

    // Include medium term top tracks
    ...artistInMediumTerm
      .filter(
        (track) =>
          !artistInShortTerm.some((t) => t.id === track.id) &&
          !artistRecentlyPlayed.some((item) => item.track.id === track.id)
      )
      .map((track) => ({
        track,
        source: "medium_term" as Source,
      })),

    // Include long term top tracks
    ...artistInLongTerm
      .filter(
        (track) =>
          !artistInShortTerm.some((t) => t.id === track.id) &&
          !artistInMediumTerm.some((t) => t.id === track.id) &&
          !artistRecentlyPlayed.some((item) => item.track.id === track.id)
      )
      .map((track) => ({
        track,
        source: "long_term" as Source,
      })),
  ];

  // Calculate time of day distribution only from verified timestamps
  const timeOfDayCount: Record<string, number> = {
    morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0,
  };

  // Process only recently played tracks for time-of-day (we have real timestamps)
  artistRecentlyPlayed.forEach((item) => {
    const playedAt = new Date(item.played_at);

    // Count plays by time of day
    const hour = playedAt.getHours();
    if (hour >= 5 && hour < 12) timeOfDayCount.morning++;
    else if (hour >= 12 && hour < 17) timeOfDayCount.afternoon++;
    else if (hour >= 17 && hour < 21) timeOfDayCount.evening++;
    else timeOfDayCount.night++;

    // Add duration from verified plays
    totalListensMs += item.track.duration_ms;
  });

  // Add estimated duration from top tracks
  totalListensMs += calculateApproximatePlaytime(artistInShortTerm);
  totalListensMs += calculateApproximatePlaytime(artistInMediumTerm);
  totalListensMs += calculateApproximatePlaytime(artistInLongTerm);

  // Determine favorite track using combined history
  const trackCounts: Record<string, { count: number; track: Track }> = {};

  // Count occurrences with weighting based on source
  trackHistory.forEach((item) => {
    const trackId = item.track.id;

    if (!trackCounts[trackId]) {
      trackCounts[trackId] = { count: 0, track: item.track };
    }

    // Weight recently played tracks higher
    if (item.source === "recent") {
      trackCounts[trackId].count += 1.5;
    }
    // Weight short_term higher than medium_term, etc.
    else if (item.source === "short_term") {
      trackCounts[trackId].count += 1.0;
    } else if (item.source === "medium_term") {
      trackCounts[trackId].count += 0.8;
    } else if (item.source === "long_term") {
      trackCounts[trackId].count += 0.5;
    }
  });

  // Find track with highest count
  const sortedTracks = Object.entries(trackCounts).sort(
    (a, b) => b[1].count - a[1].count
  );

  if (sortedTracks.length > 0) {
    favoriteTrackId = sortedTracks[0][0];
  }

  // Determine if listening is trending up or down based on presence in different time ranges
  if (artistInShortTerm.length > artistInMediumTerm.length) {
    listenTrend = "rising";
  } else if (
    artistInShortTerm.length < artistInMediumTerm.length &&
    artistInShortTerm.length > 0
  ) {
    listenTrend = "falling";
  }

  // Calculate top time of day (if we have any time data)
  const topTimeOfDay = Object.entries(timeOfDayCount).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0];

  return {
    rankInTopArtists: artistRank, // Use the actual rank from top artists
    totalListensMs,
    listenTrend,
    topTimeOfDay,
    favoriteTrackId,
    trackHistory: trackHistory,
  };
}

// Estimate playtime from top tracks (approximate since we don't know exact play counts)
function calculateApproximatePlaytime(tracks: Track[]): number {
  // We'll estimate that tracks in top tracks are played approximately 5 times each
  const ESTIMATED_PLAYS = 5;
  return tracks.reduce(
    (total, track) => total + track.duration_ms * ESTIMATED_PLAYS,
    0
  );
}

// Adjust color brightness
function adjustColorBrightness(color: string, amount: number): string {
  if (color.startsWith("hsl")) {
    const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (match) {
      const h = parseInt(match[1]);
      const s = parseInt(match[2]);
      const l = parseInt(match[3]);

      return `hsl(${h}, ${s}%, ${Math.max(0, Math.min(100, l + amount))}%)`;
    }
  }

  // If it's a hex color
  if (color.startsWith("#")) {
    let hex = color.substring(1);
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));

    return `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }

  return color;
}

// Adjust color opacity
function adjustColorOpacity(color: string, opacity: number): string {
  // If it's a hex color
  if (color.startsWith("#")) {
    let hex = color.substring(1);
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  // If it's an HSL color
  if (color.startsWith("hsl")) {
    return color.replace(")", `, ${opacity})`).replace("hsl", "hsla");
  }

  return color;
}
