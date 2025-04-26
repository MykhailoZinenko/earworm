"use client";

import { useState, useRef, useEffect } from "react";
import { PlayHistoryItem } from "../page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, X, Filter, Search } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useClickAway } from "@/hooks/use-click-away";

interface HistoryFiltersProps {
  historyData: PlayHistoryItem[];
  dateRange: { start?: Date; end?: Date };
  selectedArtists: string[];
  onDateRangeChange: (range: { start?: Date; end?: Date }) => void;
  onArtistsChange: (artistIds: string[]) => void;
}

export function HistoryFilters({
  historyData,
  dateRange,
  selectedArtists,
  onDateRangeChange,
  onArtistsChange,
}: HistoryFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useClickAway(dropdownRef, (event) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setShowDropdown(false);
    }
  });

  // Extract unique artists from history data
  const uniqueArtists = Array.from(
    historyData.reduce((artists, item) => {
      item.track.artists.forEach((artist) => {
        artists.set(artist.id, {
          id: artist.id,
          name: artist.name,
        });
      });
      return artists;
    }, new Map<string, { id: string; name: string }>())
  )
    .map(([_, artist]) => artist)
    .sort((a, b) => a.name.localeCompare(b.name));

  // Filter artists based on search
  const filteredArtists = searchQuery
    ? uniqueArtists.filter((artist) =>
        artist.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const clearFilters = () => {
    onDateRangeChange({});
    onArtistsChange([]);
    setSearchQuery("");
  };

  const hasActiveFilters =
    dateRange.start || dateRange.end || selectedArtists.length > 0;

  const handleArtistSelect = (artistId: string) => {
    if (!selectedArtists.includes(artistId)) {
      onArtistsChange([...selectedArtists, artistId]);
    }
    setSearchQuery("");
    setShowDropdown(false);
  };

  const handleArtistRemove = (artistId: string) => {
    onArtistsChange(selectedArtists.filter((id) => id !== artistId));
  };

  return (
    <Card className="bg-white/5 p-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Toggle Filters Button */}
        <Button
          variant="outline"
          className={cn(
            "border-white/10",
            showFilters ? "bg-[#1ED760] text-black" : ""
          )}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            {dateRange.start && (
              <Badge
                variant="secondary"
                className="bg-[#1ED760]/20 border border-[#1ED760]/30"
              >
                From: {format(dateRange.start, "MMM d, yyyy")}
                <button
                  onClick={() =>
                    onDateRangeChange({ ...dateRange, start: undefined })
                  }
                  className="ml-2 hover:text-[#1ED760]"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}

            {dateRange.end && (
              <Badge
                variant="secondary"
                className="bg-[#1ED760]/20 border border-[#1ED760]/30"
              >
                To: {format(dateRange.end, "MMM d, yyyy")}
                <button
                  onClick={() =>
                    onDateRangeChange({ ...dateRange, end: undefined })
                  }
                  className="ml-2 hover:text-[#1ED760]"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}

            {selectedArtists.map((artistId) => {
              const artist = uniqueArtists.find((a) => a.id === artistId);
              return (
                artist && (
                  <Badge
                    key={artistId}
                    variant="secondary"
                    className="bg-[#1ED760]/20 border border-[#1ED760]/30"
                  >
                    {artist.name}
                    <button
                      onClick={() => handleArtistRemove(artistId)}
                      className="ml-2 hover:text-[#1ED760]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )
              );
            })}

            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-white/60 hover:text-white"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Expandable Filters Section */}
      {showFilters && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Date Range Filters */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <div className="flex flex-col gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.start && "text-white/60"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.start
                      ? format(dateRange.start, "MMM d, yyyy")
                      : "Start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.start}
                    onSelect={(date) => {
                      if (date) {
                        date.setHours(0, 0, 0, 0);
                      }
                      onDateRangeChange({ ...dateRange, start: date });
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.end && "text-white/60"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.end
                      ? format(dateRange.end, "MMM d, yyyy")
                      : "End date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.end}
                    onSelect={(date) => {
                      if (date) {
                        date.setHours(23, 59, 59, 999);
                      }
                      onDateRangeChange({ ...dateRange, end: date });
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Artist Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Artists</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
              <Input
                placeholder="Search artists..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                className="pl-10"
              />
              {showDropdown && searchQuery && filteredArtists.length > 0 && (
                <div
                  ref={dropdownRef}
                  className="absolute z-10 w-full mt-1 bg-[#282828] border border-white/10 rounded-md shadow-lg max-h-60 overflow-auto"
                >
                  {filteredArtists.map((artist) => (
                    <div
                      key={artist.id}
                      className="px-4 py-2 hover:bg-white/10 cursor-pointer text-sm"
                      onClick={() => handleArtistSelect(artist.id)}
                    >
                      {artist.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Date Filters */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quick Filters</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  const start = new Date(today);
                  const end = new Date(today);
                  start.setHours(0, 0, 0, 0);
                  end.setHours(23, 59, 59, 999);
                  onDateRangeChange({ start, end });
                }}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  const yesterday = new Date(today);
                  yesterday.setDate(yesterday.getDate() - 1);
                  yesterday.setHours(0, 0, 0, 0);
                  const end = new Date(yesterday);
                  end.setHours(23, 59, 59, 999);
                  onDateRangeChange({ start: yesterday, end });
                }}
              >
                Yesterday
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  const lastWeek = new Date(today);
                  lastWeek.setDate(lastWeek.getDate() - 7);
                  lastWeek.setHours(0, 0, 0, 0);
                  today.setHours(23, 59, 59, 999);
                  onDateRangeChange({ start: lastWeek, end: today });
                }}
              >
                Last 7 days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  const lastMonth = new Date(today);
                  lastMonth.setDate(lastMonth.getDate() - 30);
                  lastMonth.setHours(0, 0, 0, 0);
                  today.setHours(23, 59, 59, 999);
                  onDateRangeChange({ start: lastMonth, end: today });
                }}
              >
                Last 30 days
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
