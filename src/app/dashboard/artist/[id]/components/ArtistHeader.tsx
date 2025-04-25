"use client";

import { Artist } from "@spotify/web-api-ts-sdk";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  ArrowLeft,
  Play,
  Share2,
  Clock,
  TrendingUp,
  TrendingDown,
  Music,
} from "lucide-react";
import { ListenData } from "../page";

interface ArtistHeaderProps {
  artist: Artist;
  isFollowing: boolean;
  onToggleFollow: () => void;
  onBack: () => void;
  onShare: () => void;
  listenData: ListenData;
  dominantColor: string;
}

export function ArtistHeader({
  artist,
  isFollowing,
  onToggleFollow,
  onBack,
  onShare,
  listenData,
  dominantColor,
}: ArtistHeaderProps) {
  // Create a gradient background with the artist's image and dominant color
  const bannerStyle = artist.images?.length
    ? {
        backgroundImage: `linear-gradient(to bottom, ${dominantColor}dd, ${dominantColor}66, rgba(18, 18, 18, 1)), url(${artist.images[0].url})`,
        backgroundSize: "cover",
        backgroundPosition: "center 33%",
      }
    : { backgroundColor: dominantColor };

  // Format total listen time in a human-readable way
  const formatListenTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);

    if (hours > 0) {
      return `${hours} hr ${minutes} min`;
    }
    return `${minutes} min`;
  };

  // Get trend icon based on listen trend
  const getTrendIcon = () => {
    switch (listenData.listenTrend) {
      case "rising":
        return <TrendingUp size={16} className="text-[#1ED760]" />;
      case "falling":
        return <TrendingDown size={16} className="text-[#FF5722]" />;
      default:
        return null;
    }
  };

  return (
    <div className="relative xl:h-[380px] @container" style={bannerStyle}>
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#121212]"></div>

      {/* Content */}
      <div className="relative h-full pt-8 px-4 @xl:px-8 @2xl:px-12 pb-6 flex flex-col justify-end z-10">
        {/* Actions row */}
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 hover:text-white"
          >
            <ArrowLeft size={20} />
          </Button>

          <Button
            onClick={onShare}
            variant="ghost"
            size="icon"
            className="rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 hover:text-white"
          >
            <Share2 size={20} />
          </Button>
        </div>

        {/* Artist info blocks */}
        <div className="grid grid-cols-1 @xl:grid-cols-[auto_1fr] gap-6 @xl:gap-8 items-end mt-10 @xl:mt-0">
          {/* Artist Image */}
          <div className="relative w-fit">
            <div className="w-40 h-40 @xl:w-52 @xl:h-52 rounded-lg overflow-hidden shadow-2xl border-2 border-white/10 bg-black/20">
              {artist.images?.length ? (
                <img
                  src={artist.images[0].url}
                  alt={artist.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="bg-[#333] w-full h-full flex items-center justify-center">
                  <span className="text-4xl">🎵</span>
                </div>
              )}
            </div>

            {/* Verify badge for popular artists */}
            {artist.popularity > 75 && (
              <div className="absolute -top-2 -right-2 bg-[#1ED760] rounded-full p-1">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Name & Stats */}
          <div className="flex flex-col gap-2">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {artist.genres && artist.genres.length > 0 && (
                <Badge className="bg-black/40 backdrop-blur-sm text-white border-none">
                  {artist.genres[0].replace(/-/g, " ")}
                </Badge>
              )}

              {listenData.rankInTopArtists &&
                listenData.rankInTopArtists <= 50 && (
                  <Badge className="bg-[#1ED760] text-black border-none flex items-center gap-1">
                    <Music size={12} />#{listenData.rankInTopArtists} in Your
                    Top Artists
                  </Badge>
                )}
            </div>

            {/* Artist name */}
            <h1 className="text-4xl @xl:text-5xl @2xl:text-6xl font-extrabold text-white tracking-tight">
              {artist.name}
            </h1>

            {/* Stats */}
            <div className="flex flex-wrap items-center text-sm text-white/80 gap-2 mt-1">
              <span className="font-semibold">
                {new Intl.NumberFormat().format(artist.followers?.total || 0)}{" "}
                followers
              </span>
              <span className="w-1 h-1 rounded-full bg-white/40"></span>
              <span>Popularity: {artist.popularity}/100</span>

              {/* User listen stats */}
              {listenData.totalListensMs > 0 && (
                <>
                  <span className="w-1 h-1 rounded-full bg-white/40"></span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {formatListenTime(listenData.totalListensMs)} of listening
                    time
                    {getTrendIcon()}
                  </span>
                </>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <Button
                variant="default"
                className="bg-[#1ED760] text-black hover:bg-[#1ED760]/90 rounded-full"
              >
                <Play size={18} className="fill-black mr-2" />
                Play
              </Button>

              <Button
                onClick={onToggleFollow}
                variant="outline"
                className={`rounded-full border-white/40 text-white hover:border-white transition-all duration-300 ${
                  isFollowing
                    ? "border-[#1ED760] bg-[#1ED760]/10 text-[#1ED760]"
                    : ""
                }`}
              >
                <Heart
                  size={18}
                  className={`${
                    isFollowing ? "fill-[#1ED760]" : ""
                  } transition-all duration-300`}
                />
                <span className="ml-2">
                  {isFollowing ? "Following" : "Follow"}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
