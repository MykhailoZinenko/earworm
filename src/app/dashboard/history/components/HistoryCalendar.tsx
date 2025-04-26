// src/app/dashboard/history/components/HistoryCalendar.tsx
"use client";

import { PlayHistoryItem } from "../page";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

interface HistoryCalendarProps {
  data: PlayHistoryItem[];
}

export function HistoryCalendar({ data }: HistoryCalendarProps) {
  // Process data for calendar visualization
  const playsByDate = data.reduce((acc, item) => {
    const date = new Date(item.played_at).toISOString().split("T")[0];
    if (!acc[date]) {
      acc[date] = {
        count: 0,
        tracks: [],
      };
    }
    acc[date].count += 1;
    acc[date].tracks.push(item);
    return acc;
  }, {} as Record<string, { count: number; tracks: PlayHistoryItem[] }>);

  // Get date range
  const dates = Object.keys(playsByDate);
  if (dates.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-white/60">No listening history available</p>
      </Card>
    );
  }

  const oldestDate = new Date(
    Math.min(...dates.map((d) => new Date(d).getTime()))
  );
  const newestDate = new Date(
    Math.max(...dates.map((d) => new Date(d).getTime()))
  );

  // Generate weeks for the calendar
  const weeks: Date[][] = [];
  const startDate = new Date(oldestDate);
  startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from Sunday

  const endDate = new Date(newestDate);
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay())); // End on Saturday

  let currentDate = new Date(startDate);
  let currentWeek: Date[] = [];

  while (currentDate <= endDate) {
    currentWeek.push(new Date(currentDate));
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Calculate intensity for color scaling
  const maxCount = Math.max(...Object.values(playsByDate).map((d) => d.count));

  const getColorIntensity = (count: number) => {
    if (count === 0) return "bg-white/5";
    const intensity = Math.min(Math.floor((count / maxCount) * 5), 5);
    const colors = [
      "bg-[#1ED760]/20",
      "bg-[#1ED760]/40",
      "bg-[#1ED760]/60",
      "bg-[#1ED760]/80",
      "bg-[#1ED760]",
    ];
    return colors[intensity - 1];
  };

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-8">
      {/* Legend */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-white/60">Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded ${
                  i === 0 ? "bg-white/5" : getColorIntensity(i * (maxCount / 5))
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-white/60">More</span>
        </div>

        <div className="text-white/60 text-sm">{data.length} tracks played</div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="flex gap-1 mb-2 ml-10">
            {Array.from(
              new Set(
                weeks.flatMap((week) => week.map((date) => date.getMonth()))
              )
            ).map((month) => (
              <div
                key={month}
                className="text-xs text-white/60 w-[calc(100%/12)]"
              >
                {months[month]}
              </div>
            ))}
          </div>

          <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col gap-1 mr-2">
              {weekDays.map((day, i) => (
                <div
                  key={day}
                  className={`text-xs text-white/60 h-4 flex items-center justify-end ${
                    i % 2 === 0 ? "visible" : "invisible"
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar cells */}
            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((date, dayIndex) => {
                    const dateString = date.toISOString().split("T")[0];
                    const dayData = playsByDate[dateString];
                    const count = dayData?.count || 0;

                    return (
                      <TooltipProvider key={`${weekIndex}-${dayIndex}`}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`w-4 h-4 rounded ${getColorIntensity(
                                count
                              )} 
                                ${
                                  count > 0
                                    ? "cursor-pointer hover:ring-2 hover:ring-white/30"
                                    : ""
                                }`}
                            />
                          </TooltipTrigger>
                          {count > 0 && (
                            <TooltipContent className="bg-[#282828] border-none p-3">
                              <div className="space-y-2">
                                <div className="font-medium">
                                  {date.toLocaleDateString(undefined, {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </div>
                                <div className="text-sm text-white/60">
                                  {count} tracks played
                                </div>
                                {dayData && (
                                  <div className="text-xs text-white/40">
                                    {dayData.tracks
                                      .slice(0, 3)
                                      .map((item, i) => (
                                        <div key={i} className="truncate">
                                          {item.track.name} -{" "}
                                          {item.track.artists[0].name}
                                        </div>
                                      ))}
                                    {dayData.tracks.length > 3 && (
                                      <div>
                                        ...and {dayData.tracks.length - 3} more
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Summary */}
      <Card className="bg-white/5 p-6">
        <h3 className="text-lg font-semibold mb-4">Activity Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-2xl font-bold text-[#1ED760]">
              {Object.keys(playsByDate).length}
            </div>
            <div className="text-sm text-white/60">Days with activity</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#1ED760]">
              {Math.max(...Object.values(playsByDate).map((d) => d.count))}
            </div>
            <div className="text-sm text-white/60">Most tracks in a day</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#1ED760]">
              {Math.round(data.length / Object.keys(playsByDate).length)}
            </div>
            <div className="text-sm text-white/60">Average tracks per day</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
