// src/app/dashboard/history/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Track } from "@spotify/web-api-ts-sdk";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, Calendar, Clock, BarChart2, Filter } from "lucide-react";
import { HistoryTimeline } from "./components/HistoryTimeline";
import { HistoryStats } from "./components/HistoryStats";
import { HistoryCalendar } from "./components/HistoryCalendar";
import { HistoryFilters } from "./components/HistoryFilters";
import { LoadingView } from "@/components/shared/LoadingView";
import { ErrorView } from "@/components/shared/ErrorView";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export interface PlayHistoryItem {
  track: Track;
  played_at: string;
}

export default function HistoryPage() {
  const { spotifyClient } = useAuth();
  const router = useRouter();
  const [historyData, setHistoryData] = useState<PlayHistoryItem[]>([]);
  const [filteredData, setFilteredData] = useState<PlayHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [selectedView, setSelectedView] = useState<
    "timeline" | "calendar" | "stats"
  >("timeline");

  useEffect(() => {
    const fetchHistory = async () => {
      if (!spotifyClient) return;

      try {
        setIsLoading(true);

        // Fetch recently played tracks - we'll get the maximum available (50)
        const recentlyPlayed =
          await spotifyClient.player.getRecentlyPlayedTracks(50);
        const formattedHistory = recentlyPlayed.items.map((item) => ({
          track: item.track,
          played_at: item.played_at,
        }));

        setHistoryData(formattedHistory);
        setFilteredData(formattedHistory);
      } catch (err) {
        console.error("Error fetching history:", err);
        setError("Failed to load listening history");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [spotifyClient]);

  // Filter data based on selections
  useEffect(() => {
    let filtered = [...historyData];

    // Apply date range filter
    if (dateRange.start) {
      filtered = filtered.filter(
        (item) => new Date(item.played_at) >= dateRange.start!
      );
    }
    if (dateRange.end) {
      filtered = filtered.filter(
        (item) => new Date(item.played_at) <= dateRange.end!
      );
    }

    // Apply artist filter
    if (selectedArtists.length > 0) {
      filtered = filtered.filter((item) =>
        item.track.artists.some((artist) => selectedArtists.includes(artist.id))
      );
    }

    setFilteredData(filtered);
  }, [historyData, dateRange, selectedArtists]);

  // Export to CSV
  const exportToCSV = () => {
    if (filteredData.length === 0) {
      toast.error("No data to export");
      return;
    }

    const csvContent = [
      // Headers
      ["Track Name", "Artist", "Album", "Played At", "Duration (ms)"].join(","),
      // Data rows
      ...filteredData.map((item) =>
        [
          `"${item.track.name.replace(/"/g, '""')}"`,
          `"${item.track.artists
            .map((a) => a.name)
            .join(", ")
            .replace(/"/g, '""')}"`,
          `"${item.track.album.name.replace(/"/g, '""')}"`,
          item.played_at,
          item.track.duration_ms,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `earworm_history_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    toast.success("History exported successfully");
  };

  if (isLoading) {
    return <LoadingView />;
  }

  if (error) {
    return <ErrorView error={error} onBack={() => router.back()} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1E1E1E] to-[#121212] text-white p-4 md:p-8">
      {/* Header */}
      <div className="mb-4 md:mb-8">
        <div className="container mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                Listening History
              </h1>
              <p className="text-white/60 mt-1">
                Explore your music journey over time
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto mb-6 md:mb-10">
        {/* Filters */}
        <HistoryFilters
          historyData={historyData}
          dateRange={dateRange}
          selectedArtists={selectedArtists}
          onDateRangeChange={setDateRange}
          onArtistsChange={setSelectedArtists}
        />

        {/* View Tabs */}
        <Tabs
          value={selectedView}
          onValueChange={(v) => setSelectedView(v as typeof selectedView)}
          className="mt-8 flex items-center md:items-start"
        >
          <TabsList className="bg-[#282828] border-none w-full md:w-auto">
            <TabsTrigger
              value="timeline"
              className="data-[state=active]:bg-[#1ED760] data-[state=active]:text-black"
            >
              <Clock className="w-4 h-4 mr-2" />
              Timeline
            </TabsTrigger>
            <TabsTrigger
              value="calendar"
              className="data-[state=active]:bg-[#1ED760] data-[state=active]:text-black"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Calendar View
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="data-[state=active]:bg-[#1ED760] data-[state=active]:text-black"
            >
              <BarChart2 className="w-4 h-4 mr-2" />
              Statistics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="mt-6 w-full">
            <HistoryTimeline data={filteredData} />
          </TabsContent>

          <TabsContent value="calendar" className="mt-6 w-full">
            <HistoryCalendar data={filteredData} />
          </TabsContent>

          <TabsContent value="stats" className="mt-6 w-full">
            <HistoryStats data={filteredData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
