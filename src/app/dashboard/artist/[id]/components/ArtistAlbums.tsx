"use client";

import { SimplifiedAlbum } from "@spotify/web-api-ts-sdk";
import { Play, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ArtistAlbumsProps {
  albums: SimplifiedAlbum[];
}

export function ArtistAlbums({ albums }: ArtistAlbumsProps) {
  // Sort albums by release date (newest first)
  const sortedAlbums = [...albums].sort((a, b) => {
    const dateA = new Date(a.release_date);
    const dateB = new Date(b.release_date);
    return dateB.getTime() - dateA.getTime();
  });

  // Format release date
  const formatReleaseDate = (dateStr: string) => {
    // Handle different date formats from Spotify (YYYY, YYYY-MM, YYYY-MM-DD)
    const date = new Date(dateStr);
    // Check if it's a valid date
    if (isNaN(date.getTime())) return dateStr;

    // Check precision format
    if (dateStr.length === 4) {
      // Only year
      return dateStr;
    } else if (dateStr.length === 7) {
      // Year and month
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "short",
      };
      return new Intl.DateTimeFormat("en-US", options).format(date);
    } else {
      // Full date
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "short",
        day: "numeric",
      };
      return new Intl.DateTimeFormat("en-US", options).format(date);
    }
  };

  // Group albums by year
  const albumsByYear: Record<string, SimplifiedAlbum[]> = {};
  sortedAlbums.forEach((album) => {
    const year = album.release_date.substring(0, 4);
    if (!albumsByYear[year]) {
      albumsByYear[year] = [];
    }
    albumsByYear[year].push(album);
  });

  // Get years sorted in descending order
  const years = Object.keys(albumsByYear).sort(
    (a, b) => parseInt(b) - parseInt(a)
  );

  return (
    <div className="space-y-8">
      {years.map((year) => (
        <div key={year} className="space-y-4">
          <h3 className="font-semibold text-white/70 flex items-center gap-2">
            <Calendar size={18} />
            {year}
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {albumsByYear[year].map((album) => (
              <div
                key={album.id}
                className="group transition-all duration-300 relative"
              >
                <Link href={`/dashboard/album/${album.id}`}>
                  <div className="bg-white/5 rounded-lg overflow-hidden relative aspect-square">
                    {album.images && album.images.length > 0 ? (
                      <img
                        src={album.images[0].url}
                        alt={album.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#333] flex items-center justify-center">
                        <span className="text-2xl">💿</span>
                      </div>
                    )}

                    {/* Play button overlay */}
                    <div
                      className={`absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                    >
                      <Button
                        size="icon"
                        className="w-12 h-12 rounded-full bg-[#1ED760] text-black hover:bg-[#1ED760]/90 hover:scale-105 transition-transform"
                      >
                        <Play size={24} className="fill-black ml-1" />
                      </Button>
                    </div>

                    {/* Release year/date badge */}
                    <Badge className="absolute bottom-2 left-2 bg-black/60 text-white border-none text-xs">
                      {formatReleaseDate(album.release_date)}
                    </Badge>
                  </div>

                  <div className="mt-2">
                    <h4 className="font-medium text-white truncate">
                      {album.name}
                    </h4>
                    <p className="text-xs text-white/60">
                      {album.total_tracks}{" "}
                      {album.total_tracks === 1 ? "song" : "songs"}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
