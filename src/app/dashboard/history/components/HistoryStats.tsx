// src/app/dashboard/history/components/HistoryStats.tsx
"use client";

import { PlayHistoryItem } from "../page";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Music, Clock, Calendar, Star, TrendingUp } from "lucide-react";
import Link from "next/link";
import { formatDuration } from "@/lib/format-utils";
import { Track } from "@spotify/web-api-ts-sdk";

interface HistoryStatsProps {
  data: PlayHistoryItem[];
}

export function HistoryStats({ data }: HistoryStatsProps) {
  // Calculate various statistics
  const totalListeningTime = data.reduce(
    (sum, item) => sum + item.track.duration_ms,
    0
  );

  // Top Artists
  const artistPlayCount = data.reduce((acc, item) => {
    item.track.artists.forEach((artist) => {
      if (!acc[artist.id]) {
        acc[artist.id] = {
          name: artist.name,
          id: artist.id,
          count: 0,
          duration: 0,
        };
      }
      acc[artist.id].count += 1;
      acc[artist.id].duration += item.track.duration_ms;
    });
    return acc;
  }, {} as Record<string, { name: string; id: string; count: number; duration: number }>);

  const topArtists = Object.values(artistPlayCount)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Top Tracks
  const trackPlayCount = data.reduce((acc, item) => {
    const trackId = item.track.id;
    if (!acc[trackId]) {
      acc[trackId] = {
        track: item.track,
        count: 0,
      };
    }
    acc[trackId].count += 1;
    return acc;
  }, {} as Record<string, { track: Track; count: number }>);

  const topTracks = Object.values(trackPlayCount)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Listening time by hour
  const hourlyData = data.reduce((acc, item) => {
    const hour = new Date(item.played_at).getHours();
    if (!acc[hour]) {
      acc[hour] = 0;
    }
    acc[hour] += 1;
    return acc;
  }, {} as Record<number, number>);

  const hourlyChartData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: hourlyData[i] || 0,
    label: `${i.toString().padStart(2, "0")}:00`,
  }));

  // Day of week distribution
  const weekDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const weekdayData = data.reduce((acc, item) => {
    const day = new Date(item.played_at).getDay();
    if (!acc[day]) {
      acc[day] = 0;
    }
    acc[day] += 1;
    return acc;
  }, {} as Record<number, number>);

  const weekdayChartData = weekDays.map((day, i) => ({
    day,
    count: weekdayData[i] || 0,
  }));

  // Genre distribution (from tracks' artists)
  const genreCount: Record<string, number> = {};

  // We'll need to fetch artist details to get genres, but for now, let's use a simplified approach

  const pieColors = ["#1ED760", "#1DB954", "#19A945", "#169C3D", "#138F35"];

  const chartConfig = {
    count: {
      label: "Plays",
      color: "#1ED760",
    },
  };

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/5 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Music className="w-5 h-5 text-[#1ED760]" />
            <h3 className="font-medium">Total Tracks</h3>
          </div>
          <div className="text-3xl font-bold">{data.length}</div>
        </Card>

        <Card className="bg-white/5 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-[#1ED760]" />
            <h3 className="font-medium">Total Time</h3>
          </div>
          <div className="text-3xl font-bold">
            {Math.floor(totalListeningTime / 3600000)}h{" "}
            {Math.floor((totalListeningTime % 3600000) / 60000)}m
          </div>
        </Card>

        <Card className="bg-white/5 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Star className="w-5 h-5 text-[#1ED760]" />
            <h3 className="font-medium">Unique Artists</h3>
          </div>
          <div className="text-3xl font-bold">
            {Object.keys(artistPlayCount).length}
          </div>
        </Card>

        <Card className="bg-white/5 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-[#1ED760]" />
            <h3 className="font-medium">Unique Tracks</h3>
          </div>
          <div className="text-3xl font-bold">
            {Object.keys(trackPlayCount).length}
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Hourly Distribution */}
        <Card className="bg-white/5 p-6 overflow-hidden">
          <h3 className="text-lg font-semibold mb-4">
            Listening Activity by Hour
          </h3>
          <div className="h-[250px] flex items-center justify-center overflow-hidden">
            <ChartContainer config={chartConfig} className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={hourlyChartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis
                    dataKey="label"
                    stroke="#888"
                    fontSize={12}
                    tickFormatter={(value) => value.substring(0, 2)}
                    allowDataOverflow={true}
                  />
                  <YAxis stroke="#888" fontSize={12} width={30} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="#1ED760" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </Card>

        {/* Day of Week Distribution */}
        <Card className="bg-white/5 p-6 overflow-hidden">
          <h3 className="text-lg font-semibold mb-4">
            Activity by Day of Week
          </h3>
          <div className="h-[250px] flex items-center justify-center overflow-hidden">
            <ChartContainer config={chartConfig} className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weekdayChartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis
                    dataKey="day"
                    stroke="#888"
                    fontSize={12}
                    tickFormatter={(value) => value.substring(0, 3)}
                    allowDataOverflow={true}
                  />
                  <YAxis stroke="#888" fontSize={12} width={30} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="#1ED760" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </Card>

        {/* Top Artists */}
        <Card className="bg-white/5 p-6">
          <h3 className="text-lg font-semibold mb-4">Top Artists</h3>
          <div className="space-y-4">
            {topArtists.map((artist, index) => (
              <div key={artist.id} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[#1ED760] flex items-center justify-center font-bold text-black">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <Link
                    href={`/dashboard/artist/${artist.id}`}
                    className="font-medium hover:text-[#1ED760] transition-colors"
                  >
                    {artist.name}
                  </Link>
                  <div className="text-sm text-white/60">
                    {artist.count} plays • {formatDuration(artist.duration)}
                  </div>
                  <Progress
                    value={(artist.count / data.length) * 100}
                    className="h-1.5 mt-1"
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Tracks */}
        <Card className="bg-white/5 p-6">
          <h3 className="text-lg font-semibold mb-4">Most Played Tracks</h3>
          <div className="space-y-4">
            {topTracks.map((item, index) => (
              <div key={item.track.id} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[#1ED760] flex items-center justify-center font-bold text-black">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <Link
                    href={`/dashboard/track/${item.track.id}`}
                    className="font-medium hover:text-[#1ED760] transition-colors"
                  >
                    {item.track.name}
                  </Link>
                  <div className="text-sm text-white/60">
                    {item.track.artists.map((a) => a.name).join(", ")} •{" "}
                    {item.count} plays
                  </div>
                  <Progress
                    value={
                      (item.count /
                        Math.max(
                          ...Object.values(trackPlayCount).map((t) => t.count)
                        )) *
                      100
                    }
                    className="h-1.5 mt-1"
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Listening Trends */}
      <Card className="bg-white/5 p-6">
        <h3 className="text-lg font-semibold mb-4">Listening Trends</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-white/60 mb-1">Most Active Hour</div>
            <div className="text-xl font-semibold">
              {
                hourlyChartData.reduce((max, item) =>
                  item.count > max.count ? item : max
                ).label
              }
            </div>
          </div>
          <div>
            <div className="text-sm text-white/60 mb-1">Most Active Day</div>
            <div className="text-xl font-semibold">
              {
                weekdayChartData.reduce((max, item) =>
                  item.count > max.count ? item : max
                ).day
              }
            </div>
          </div>
          <div>
            <div className="text-sm text-white/60 mb-1">
              Average Daily Plays
            </div>
            <div className="text-xl font-semibold">
              {Math.round(
                data.length /
                  new Set(
                    data.map((item) =>
                      new Date(item.played_at).toLocaleDateString()
                    )
                  ).size
              )}
            </div>
          </div>
          <div>
            <div className="text-sm text-white/60 mb-1">Longest Session</div>
            <div className="text-xl font-semibold">
              {formatDuration(
                Math.max(
                  ...Object.values(artistPlayCount).map((a) => a.duration)
                )
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
