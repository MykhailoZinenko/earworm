"use client";

import { PlayHistoryItem } from "../page";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-responsive";
import { CalendarIcon, Clock, Play } from "lucide-react";
import Link from "next/link";

interface HistoryTimelineProps {
  data: PlayHistoryItem[];
}

export function HistoryTimeline({ data }: HistoryTimelineProps) {
  const isMobile = useIsMobile();

  // Group data by date
  const groupedData = data.reduce((acc, item) => {
    const date = new Date(item.played_at).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {} as Record<string, PlayHistoryItem[]>);

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedData).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
    }
  };

  return (
    <ScrollArea className="h-[calc(100vh-320px)]">
      <div className="space-y-8">
        {sortedDates.map((date) => (
          <div key={date} className="relative">
            {/* Date Header */}
            <div className="sticky top-0 z-10 bg-[#121212] py-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-[#1ED760] rounded-full p-2">
                  <CalendarIcon className="w-4 h-4 text-black" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                  <h3 className="text-lg font-semibold">
                    {formatRelativeDate(date)}
                  </h3>
                  <span className="text-white/60 text-sm">
                    {groupedData[date].length} tracks played
                  </span>
                </div>
              </div>
            </div>

            {/* Timeline Items */}
            {isMobile ? (
              // Mobile - No timeline border
              <div className="space-y-4">
                {groupedData[date].map((item, index) => (
                  <div key={`${item.track.id}-${item.played_at}`}>
                    {/* Item Card */}
                    <div className="bg-white/5 hover:bg-white/10 rounded-lg p-4 transition-colors">
                      {/* Mobile Layout - Vertical Card */}
                      <div className="flex flex-col gap-3">
                        {/* Track Image */}
                        <div className="relative w-full aspect-square group/img mb-2">
                          {item.track.album.images[0]?.url ? (
                            <img
                              src={item.track.album.images[0].url}
                              alt={item.track.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#282828] rounded-lg flex items-center justify-center">
                              <Play className="w-10 h-10 text-white/60" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg opacity-0 group-hover/img:opacity-100 transition-opacity">
                            <Play className="w-10 h-10 text-white" />
                          </div>
                        </div>

                        {/* Track Info */}
                        <div className="flex flex-col gap-1">
                          <Link
                            href={`/dashboard/track/${item.track.id}`}
                            className="font-semibold text-lg hover:underline line-clamp-2"
                          >
                            {item.track.name}
                          </Link>
                          <div className="flex flex-col gap-0.5 text-sm text-white/60">
                            <Link
                              href={`/dashboard/artist/${item.track.artists[0].id}`}
                              className="hover:text-[#1ED760] transition-colors"
                            >
                              {item.track.artists.map((a) => a.name).join(", ")}
                            </Link>
                            <Link
                              href={`/dashboard/album/${item.track.album.id}`}
                              className="hover:text-[#1ED760] transition-colors text-xs line-clamp-1"
                            >
                              {item.track.album.name}
                            </Link>
                          </div>
                        </div>

                        {/* Time */}
                        <div className="flex items-center gap-2 text-white/60 text-sm">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(item.played_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Desktop - Timeline with border and dots
              <div className="relative space-y-4 pl-4 border-l-2 border-[#282828] ml-4">
                {groupedData[date].map((item, index) => (
                  <div
                    key={`${item.track.id}-${item.played_at}`}
                    className="relative group"
                  >
                    {/* Timeline Dot */}
                    <div className="absolute -left-[1.3rem] w-3 h-3 rounded-full bg-[#1ED760] group-hover:scale-125 transition-transform" />

                    {/* Item Card */}
                    <div className="bg-white/5 hover:bg-white/10 rounded-lg p-4 ml-6 transition-colors">
                      {/* Desktop Layout - Horizontal Card */}
                      <div className="flex items-center gap-4">
                        {/* Track Image */}
                        <div className="relative group/img">
                          <div className="w-12 h-12 rounded overflow-hidden">
                            {item.track.album.images[0]?.url ? (
                              <img
                                src={item.track.album.images[0].url}
                                alt={item.track.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-[#282828] flex items-center justify-center">
                                <Play className="w-6 h-6 text-white/60" />
                              </div>
                            )}
                          </div>
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded opacity-0 group-hover/img:opacity-100 transition-opacity">
                            <Play className="w-6 h-6 text-white" />
                          </div>
                        </div>

                        {/* Track Info */}
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/dashboard/track/${item.track.id}`}
                            className="font-medium hover:underline block truncate"
                          >
                            {item.track.name}
                          </Link>
                          <div className="flex items-center gap-2 text-sm text-white/60">
                            <Link
                              href={`/dashboard/artist/${item.track.artists[0].id}`}
                              className="hover:text-[#1ED760] transition-colors"
                            >
                              {item.track.artists.map((a) => a.name).join(", ")}
                            </Link>
                            <span>•</span>
                            <Link
                              href={`/dashboard/album/${item.track.album.id}`}
                              className="hover:text-[#1ED760] transition-colors"
                            >
                              {item.track.album.name}
                            </Link>
                          </div>
                        </div>

                        {/* Time */}
                        <div className="flex items-center gap-2 text-white/60">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(item.played_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {data.length === 0 && (
          <div className="text-center py-12 text-white/60">
            <Clock className="w-12 h-12 mx-auto mb-4 text-[#1ED760]" />
            <h3 className="text-lg font-medium mb-2">No listening history</h3>
            <p>Start listening to some music to see your history here</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
