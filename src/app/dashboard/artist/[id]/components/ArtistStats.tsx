"use client";

import { Artist } from "@spotify/web-api-ts-sdk";
import {
  UserCheck,
  Music,
  BarChart4,
  Award,
  Globe,
  HeadphonesIcon,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ListenData } from "../page";

interface ArtistStatsProps {
  artist: Artist;
  listenData: ListenData;
  dominantColor: string;
}

export function ArtistStats({
  artist,
  listenData,
  dominantColor,
}: ArtistStatsProps) {
  // Calculate listening frequency category
  const getListeningCategory = () => {
    if (!listenData.rankInTopArtists) return "Occasional";

    if (listenData.rankInTopArtists <= 5) return "Super Fan";
    if (listenData.rankInTopArtists <= 20) return "Regular Listener";
    if (listenData.rankInTopArtists <= 50) return "Frequent";
    return "Occasional";
  };

  // Format large numbers with K/M suffix
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  // Format genre names
  const formatGenre = (genre: string) => {
    return genre
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Estimate monthly listeners based on popularity score and followers
  const estimateMonthlyListeners = () => {
    const baseMultiplier = artist.popularity / 10; // Higher popularity = higher multiplier
    // Estimate: Each follower could represent ~5-20 monthly listeners, based on popularity
    return Math.round((artist.followers?.total || 0) * baseMultiplier * 0.2);
  };

  // Array of stats for the artist
  const stats = [
    {
      icon: <UserCheck size={18} style={{ color: dominantColor }} />,
      label: "Followers",
      value: formatNumber(artist.followers?.total || 0),
    },
    {
      icon: <BarChart4 size={18} style={{ color: dominantColor }} />,
      label: "Popularity Score",
      value: `${artist.popularity}/100`,
      showBar: true,
    },
    {
      icon: <Music size={18} style={{ color: dominantColor }} />,
      label: "Estimated Monthly Listeners",
      value: formatNumber(estimateMonthlyListeners()),
    },
    {
      icon: <HeadphonesIcon size={18} style={{ color: dominantColor }} />,
      label: "Your Listening Frequency",
      value: getListeningCategory(),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Key stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1 text-sm text-white/60">
              {stat.icon}
              <span>{stat.label}</span>
            </div>
            <div className="font-bold text-xl">{stat.value}</div>

            {/* Optional progress bar (e.g., for popularity) */}
            {stat.showBar && (
              <Progress
                value={artist.popularity}
                className="h-1.5 mt-2 bg-white/10"
                style={
                  {
                    "--progress-background": dominantColor,
                  } as React.CSSProperties
                }
              />
            )}
          </div>
        ))}
      </div>

      {/* Genres */}
      {artist.genres && artist.genres.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3 text-white/70 flex items-center gap-2">
            <Globe size={16} style={{ color: dominantColor }} />
            Genres
          </h3>

          <div className="flex flex-wrap gap-2">
            {artist.genres.map((genre, index) => (
              <div
                key={index}
                className="text-sm rounded-full px-3 py-1"
                style={{ backgroundColor: `${dominantColor}15` }}
              >
                {formatGenre(genre)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Artist ranking among similar artists */}
      <div>
        <h3 className="text-sm font-medium mb-3 text-white/70 flex items-center gap-2">
          <Award size={16} style={{ color: dominantColor }} />
          Global Artist Ranking
        </h3>

        <div
          className="rounded-lg p-4"
          style={{ backgroundColor: `${dominantColor}10` }}
        >
          <div className="text-center">
            <div
              className="text-2xl font-bold"
              style={{ color: dominantColor }}
            >
              {artist.popularity > 85
                ? "Top Tier"
                : artist.popularity > 70
                ? "Major Artist"
                : artist.popularity > 50
                ? "Recognized Artist"
                : "Emerging Artist"}
            </div>
            <p className="text-sm text-white/60 mt-1">
              {artist.popularity > 85
                ? "Among the most popular global artists"
                : artist.popularity > 70
                ? "Highly popular in the music scene"
                : artist.popularity > 50
                ? "Gaining significant attention"
                : "Building audience and recognition"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
