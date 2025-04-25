"use client";

import { Artist } from "@spotify/web-api-ts-sdk";
import {
  TrendingUp,
  TrendingDown,
  Award,
  Clock,
  Star,
  Lightbulb,
} from "lucide-react";
import { ListenData } from "../page";

interface ListeningInsightsProps {
  listenData: ListenData;
  artist: Artist;
  dominantColor: string;
}

export function ListeningInsights({
  listenData,
  artist,
  dominantColor,
}: ListeningInsightsProps) {
  // Format total listen time
  const formatListenTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);

    if (hours > 0) {
      return `${hours} hr ${minutes} min`;
    }
    return `${minutes} min`;
  };

  // Convert milliseconds to days equivalent
  const msToListeningDays = (ms: number) => {
    // Average person listens to 3-4 hours of music per day
    // We'll use 3.5 hours (12600000 ms) as our divisor
    const DAILY_LISTENING_MS = 3.5 * 60 * 60 * 1000;
    return (ms / DAILY_LISTENING_MS).toFixed(1);
  };

  // Generate insight message based on listen data
  const generateInsight = () => {
    if (!listenData.rankInTopArtists) {
      return "Keep exploring this artist's music to generate personalized insights.";
    }

    // Insights based on track history sources
    const hasRecentPlays = listenData.trackHistory?.some(
      (item) => item.source === "recent"
    );
    const hasShortTermPlays = listenData.trackHistory?.some(
      (item) => item.source === "short_term"
    );
    const hasMediumTermPlays = listenData.trackHistory?.some(
      (item) => item.source === "medium_term"
    );
    const hasLongTermPlays = listenData.trackHistory?.some(
      (item) => item.source === "long_term"
    );

    // Multi-term listener (consistent over time)
    if (
      (hasRecentPlays || hasShortTermPlays) &&
      hasMediumTermPlays &&
      hasLongTermPlays
    ) {
      return `${artist.name} has been a consistent part of your music journey. You've maintained interest in their music over time.`;
    }

    // Insights for top artists
    if (listenData.rankInTopArtists <= 5) {
      return `You're a super fan! ${artist.name} is among your absolute favorite artists.`;
    }

    if (listenData.rankInTopArtists <= 20) {
      return `${artist.name} has a special place in your music rotation. You've spent significant time with their music.`;
    }

    // Insights based on listening trend
    if (listenData.listenTrend === "rising") {
      return `You've been listening to ${artist.name} more frequently lately. Your interest is growing!`;
    }

    if (listenData.listenTrend === "falling") {
      return `Your listening to ${artist.name} has decreased lately, but they're still in your rotation.`;
    }

    // Recent discovery
    if (hasRecentPlays && !(hasMediumTermPlays || hasLongTermPlays)) {
      return `You've been checking out ${artist.name} recently. Keep listening to see how they fit into your music taste!`;
    }

    // Fallback insight
    return `${artist.name} is part of your broader music taste, ranking #${listenData.rankInTopArtists} among your top artists.`;
  };

  // Get artist fan persona
  const getFanPersona = () => {
    if (!listenData.rankInTopArtists) return "New Listener";

    if (listenData.rankInTopArtists <= 5) {
      return "Super Fan";
    }

    if (listenData.rankInTopArtists <= 20) {
      if (listenData.listenTrend === "rising") {
        return "Growing Enthusiast";
      }
      return "Regular Fan";
    }

    if (listenData.rankInTopArtists <= 50) {
      if (listenData.listenTrend === "rising") {
        return "Emerging Fan";
      }
      return "Casual Listener";
    }

    return "Occasional Listener";
  };

  return (
    <div className="space-y-5">
      {/* Main insight */}
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="bg-[#1ED760]/10 text-[#1ED760] rounded-full p-2 flex-shrink-0 mt-1">
            <Lightbulb size={18} />
          </div>
          <div>
            <h4 className="font-medium text-white mb-1">Personal Insight</h4>
            <p className="text-sm text-white/80">{generateInsight()}</p>
          </div>
        </div>
      </div>

      {/* Fan persona */}
      <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-lg p-4">
        <div className="bg-[#1ED760]/10 text-[#1ED760] rounded-full p-2 flex-shrink-0">
          <Star size={18} />
        </div>
        <div>
          <h4 className="font-medium text-white mb-1">Your Fan Persona</h4>
          <div className="text-2xl font-bold" style={{ color: dominantColor }}>
            {getFanPersona()}
          </div>
        </div>
      </div>

      {/* Listening stats */}
      <div>
        <h4 className="text-sm font-medium mb-3 text-white/70">
          Your Stats with {artist.name}
        </h4>

        <div className="grid grid-cols-1 gap-3">
          {/* Total listen time */}
          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-lg p-3">
            <div className="bg-[#1ED760]/10 text-[#1ED760] rounded-full p-2 flex-shrink-0">
              <Clock size={16} />
            </div>
            <div className="flex-1">
              <div className="text-sm text-white/60">Total Listening Time</div>
              <div className="font-medium">
                {formatListenTime(listenData.totalListensMs)}
              </div>
            </div>
            <div className="text-xs text-white/60 text-right">
              ~{msToListeningDays(listenData.totalListensMs)} days of listening
            </div>
          </div>

          {/* Trend */}
          {listenData.listenTrend && (
            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-lg p-3">
              <div
                className={`${
                  listenData.listenTrend === "rising"
                    ? "bg-[#1ED760]/10 text-[#1ED760]"
                    : listenData.listenTrend === "falling"
                    ? "bg-[#FF5722]/10 text-[#FF5722]"
                    : "bg-white/10 text-white/60"
                } rounded-full p-2 flex-shrink-0`}
              >
                {listenData.listenTrend === "rising" ? (
                  <TrendingUp size={16} />
                ) : listenData.listenTrend === "falling" ? (
                  <TrendingDown size={16} />
                ) : (
                  <TrendingUp size={16} />
                )}
              </div>
              <div className="flex-1">
                <div className="text-sm text-white/60">Listening Trend</div>
                <div className="font-medium">
                  {listenData.listenTrend === "rising"
                    ? "Increasing"
                    : listenData.listenTrend === "falling"
                    ? "Decreasing"
                    : "Steady"}
                </div>
              </div>
              <div className="text-xs text-white/60 text-right">
                Compared to previous period
              </div>
            </div>
          )}

          {/* Ranking */}
          {listenData.rankInTopArtists && (
            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-lg p-3">
              <div className="bg-[#1ED760]/10 text-[#1ED760] rounded-full p-2 flex-shrink-0">
                <Award size={16} />
              </div>
              <div className="flex-1">
                <div className="text-sm text-white/60">Your Artist Ranking</div>
                <div className="font-medium">
                  #{listenData.rankInTopArtists} in your Top Artists
                </div>
              </div>
              <div className="text-xs text-white/60 text-right">
                Based on your listening history
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
