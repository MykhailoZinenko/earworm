"use client";

import { Track } from "@spotify/web-api-ts-sdk";
import { Clock, MusicIcon, CalendarDays, HistoryIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ListenData } from "../page";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ListeningHistoryProps {
  recentlyPlayed: {
    track: Track;
    played_at: string;
  }[];
  listenData: ListenData;
  dominantColor: string;
}

export function ListeningHistory({
  recentlyPlayed,
  listenData,
  dominantColor,
}: ListeningHistoryProps) {
  const trackHistory =
    listenData.trackHistory ||
    recentlyPlayed.map((item) => ({
      track: item.track,
      source: "recent" as const,
      played_at: item.played_at,
    }));

  // First, count actual plays from recently played tracks (these have real counts)
  const actualPlayCounts: Record<string, number> = {};

  // Only count actual plays from recently played tracks
  recentlyPlayed.forEach((item) => {
    const trackId = item.track.id;
    actualPlayCounts[trackId] = (actualPlayCounts[trackId] || 0) + 1;
  });

  // Track metadata and ranking scores (separate from display counts)
  const trackMetadata: Record<
    string,
    {
      track: Track;
      actualCount: number;
      rankingScore: number; // Internal score for sorting only
      sources: Set<string>;
      lastPlayed?: string;
    }
  > = {};

  // Process all tracks to get metadata and ranking scores
  trackHistory.forEach((item) => {
    const trackId = item.track.id;

    if (!trackMetadata[trackId]) {
      trackMetadata[trackId] = {
        track: item.track,
        actualCount: actualPlayCounts[trackId] || 0,
        rankingScore: 0,
        sources: new Set(),
        lastPlayed: item.played_at,
      };
    }

    // Add source to the track's sources
    trackMetadata[trackId].sources.add(item.source);

    // Calculate ranking score for sorting (not displayed to user)
    if (item.source === "recent") {
      trackMetadata[trackId].rankingScore += 1.5;

      // Update last played date if this is more recent
      if (
        item.played_at &&
        (!trackMetadata[trackId].lastPlayed ||
          new Date(item.played_at) >
            new Date(trackMetadata[trackId].lastPlayed))
      ) {
        trackMetadata[trackId].lastPlayed = item.played_at;
      }
    } else if (item.source === "short_term") {
      trackMetadata[trackId].rankingScore += 1.0;
    } else if (item.source === "medium_term") {
      trackMetadata[trackId].rankingScore += 0.8;
    } else if (item.source === "long_term") {
      trackMetadata[trackId].rankingScore += 0.5;
    }
  });

  // Convert to array and sort by ranking score (internal)
  const sortedTracks = Object.values(trackMetadata)
    .sort((a, b) => b.rankingScore - a.rankingScore)
    .map((item) => ({
      track: item.track,
      count: item.actualCount, // Show real play count
      sources: Array.from(item.sources),
      lastPlayed: item.lastPlayed,
    }));

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000;

    // If less than a minute ago, show "less than a minute"
    if (diff < 60) {
      return "less than a minute ago";
    }

    // If less than an hour ago, show "n minute[s] ago"
    if (diff < 60 * 60) {
      const minutes = Math.floor(diff / 60);
      return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    }

    // If less than a day ago, show "n hour[s] ago"
    if (diff < 60 * 60 * 24) {
      const hours = Math.floor(diff / (60 * 60));
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    }

    // Otherwise, show full date
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  // Find most active day of week
  const getDayOfWeekDistribution = () => {
    const dayCount: Record<string, number> = {
      Sunday: 0,
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
    };

    recentlyPlayed.forEach((item) => {
      const day = new Date(item.played_at).toLocaleDateString(undefined, {
        weekday: "long",
      });
      dayCount[day] = (dayCount[day] || 0) + 1;
    });

    // Convert to percentage and find most active day
    const total = Object.values(dayCount).reduce(
      (sum, count) => sum + count,
      0
    );

    const percentages = Object.entries(dayCount)
      .map(([day, count]) => ({
        day,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.percentage - a.percentage);

    return percentages;
  };

  const dayDistribution = getDayOfWeekDistribution();
  const mostActiveDay = dayDistribution[0];

  // Get time of day distribution
  const getTimeOfDayDistribution = () => {
    const timeCount: Record<string, number> = {
      "Morning (5am-12pm)": 0,
      "Afternoon (12pm-5pm)": 0,
      "Evening (5pm-9pm)": 0,
      "Night (9pm-5am)": 0,
    };

    recentlyPlayed.forEach((item) => {
      const hour = new Date(item.played_at).getHours();

      if (hour >= 5 && hour < 12) {
        timeCount["Morning (5am-12pm)"]++;
      } else if (hour >= 12 && hour < 17) {
        timeCount["Afternoon (12pm-5pm)"]++;
      } else if (hour >= 17 && hour < 21) {
        timeCount["Evening (5pm-9pm)"]++;
      } else {
        timeCount["Night (9pm-5am)"]++;
      }
    });

    // Convert to percentage
    const total = Object.values(timeCount).reduce(
      (sum, count) => sum + count,
      0
    );

    return Object.entries(timeCount)
      .map(([time, count]) => ({
        time,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.percentage - a.percentage);
  };

  const timeDistribution = getTimeOfDayDistribution();
  const topTimeOfDay = timeDistribution[0];

  return (
    <div className="grid grid-cols-1 min-[110rem]:grid-cols-3 gap-6">
      {/* Left: Recently played tracks */}
      <div className="min-[110rem]:col-span-2 p-5">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MusicIcon size={18} style={{ color: dominantColor }} />
          Most Played Songs
        </h3>

        <ScrollArea className="h-[320px]">
          {sortedTracks.map(({ track, count, sources, lastPlayed }) => (
            <div
              key={track.id}
              className="flex items-center p-3 mb-2 rounded-lg gap-3 hover:bg-white/5 transition-colors"
            >
              {/* Track image */}
              <div className="flex-shrink-0 relative">
                <div className="w-10 h-10 rounded overflow-hidden">
                  <img
                    src={track.album.images?.[0]?.url}
                    alt={track.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Track info */}
              <div className="min-w-0 flex-1">
                <Link href={`/dashboard/track/${track.id}`}>
                  <h4 className="font-medium text-white truncate hover:underline">
                    {track.name}
                  </h4>
                </Link>

                <div className="flex items-center gap-2 text-sm text-white/60">
                  <span className="truncate">{track.album.name}</span>

                  {/* Source indicators */}
                  <div className="flex gap-1">
                    {sources.includes("recent") && (
                      <span
                        className="inline-flex items-center text-xs px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: `${dominantColor}20`,
                          color: dominantColor,
                        }}
                      >
                        Recent
                      </span>
                    )}
                    {sources.includes("short_term") && (
                      <span className="inline-flex items-center bg-white/10 text-white/80 text-xs px-1.5 py-0.5 rounded">
                        Top
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Play count & last played */}
              <div className="text-right text-sm text-white/60 hidden @xl:block">
                <div className="font-medium text-white">
                  {count === 0
                    ? "No recent plays"
                    : count + " " + (count === 1 ? "play" : "plays")}
                </div>
                {lastPlayed ? (
                  <div className="text-xs flex items-center justify-end gap-1">
                    <Clock size={12} />
                    <span>Last: {formatDate(lastPlayed)}</span>
                  </div>
                ) : (
                  <div className="text-xs text-white/40">In your top songs</div>
                )}
              </div>
            </div>
          ))}

          {sortedTracks.length === 0 && (
            <div className="text-center p-6 text-white/60">
              No listening history found for this artist
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Right: Listening patterns */}
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-5">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <HistoryIcon size={18} style={{ color: dominantColor }} />
          Your Listening Patterns
        </h3>

        <div className="space-y-6 gap-2">
          {/* Most active day */}
          <div>
            <h4 className="text-sm text-white/70 mb-2">Most Active Day</h4>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => {
                const dayFullName = [
                  "Sunday",
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                ][i];

                const dayData = dayDistribution.find(
                  (d) => d.day === dayFullName
                );
                const isActive = dayData && dayData.percentage > 0;
                const isTopDay = dayFullName === mostActiveDay.day;

                return (
                  <div
                    key={i}
                    className={`h-8 rounded flex items-center justify-center text-xs font-medium ${
                      isTopDay
                        ? "text-black"
                        : isActive
                        ? "bg-white/20"
                        : "bg-white/5"
                    }`}
                    style={{
                      backgroundColor: isTopDay ? dominantColor : undefined,
                    }}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
            <p className="text-sm">
              You listen most on{" "}
              <span className="font-medium text-white">
                {mostActiveDay.day}s
              </span>
              {mostActiveDay.percentage > 50 && " by far"}
            </p>
          </div>

          {/* Time of day */}
          <div>
            <h4 className="text-sm text-white/70 mb-2">Favorite Time of Day</h4>
            <div className="flex items-center gap-2 mb-2">
              {timeDistribution.map(({ time, percentage }) => (
                <div key={time} className="flex-1">
                  <div className="h-20 bg-white/5 rounded-t overflow-hidden flex items-end">
                    <div
                      className={`w-full`}
                      style={{
                        height: `${percentage}%`,
                        backgroundColor:
                          time === topTimeOfDay.time
                            ? dominantColor
                            : "rgba(255,255,255,0.3)",
                      }}
                    ></div>
                  </div>
                  <div className="text-[10px] text-center text-white/60 mt-1 truncate">
                    {time.split(" ")[0]}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm">
              You prefer listening in the{" "}
              <span className="font-medium text-white">
                {topTimeOfDay.time.split(" ")[0].toLowerCase()}
              </span>
            </p>
          </div>

          {/* Listening Streak - shows how consistently you listen to this artist */}
          <div>
            <h4 className="text-sm text-white/70 mb-2 flex items-center gap-1">
              <CalendarDays size={14} style={{ color: dominantColor }} />
              Listening Sources
            </h4>
            <div className="flex flex-wrap gap-1 mb-2">
              {trackHistory.some((item) => item.source === "recent") && (
                <Badge
                  className="text-black"
                  style={{ backgroundColor: dominantColor }}
                >
                  Recent
                </Badge>
              )}
              {trackHistory.some((item) => item.source === "short_term") && (
                <Badge className="bg-white/20">4 Weeks</Badge>
              )}
              {trackHistory.some((item) => item.source === "medium_term") && (
                <Badge className="bg-white/15">6 Months</Badge>
              )}
              {trackHistory.some((item) => item.source === "long_term") && (
                <Badge className="bg-white/10">All Time</Badge>
              )}
            </div>
            <p className="text-xs text-white/60">
              {trackHistory.some((item) => item.source === "recent") &&
              trackHistory.some((item) => item.source !== "recent")
                ? "Active and consistent listener"
                : trackHistory.some((item) => item.source === "recent")
                ? "Recently active listener"
                : trackHistory.some((item) => item.source === "short_term")
                ? "Frequent listener"
                : "Long-term listener"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
