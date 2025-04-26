"use client";

import { useState } from "react";
import Link from "next/link";
import { Play, Info, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArtistSimilarityScore } from "@/lib/artist-recommendation";

interface RelatedArtistsProps {
  similarArtists: ArtistSimilarityScore[];
  dominantColor?: string;
}

export function RelatedArtists({
  similarArtists,
  dominantColor = "#1ED760",
}: RelatedArtistsProps) {
  const [hoveredArtistId, setHoveredArtistId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Show only top 10 similar artists unless showAll is true
  const displayedArtists = showAll
    ? similarArtists
    : similarArtists.slice(0, 10);

  // Get match strength label based on similarity score with dominant color
  const getMatchStrength = (score: number) => {
    if (score >= 200) return { label: "Perfect Match", color: dominantColor };
    if (score >= 150)
      return { label: "Strong Match", color: `${dominantColor}dd` };
    if (score >= 100)
      return { label: "Good Match", color: `${dominantColor}bb` };
    if (score >= 70)
      return { label: "Decent Match", color: `${dominantColor}99` };
    return { label: "Mild Match", color: `${dominantColor}77` };
  };

  return (
    <ScrollArea className="h-[500px]">
      <div className="grid grid-cols-1 gap-3">
        {displayedArtists.map(({ artist, score, matchReasons }) => {
          const matchStrength = getMatchStrength(score);

          return (
            <Link key={artist.id} href={`/dashboard/artist/${artist.id}`}>
              <div
                className="flex items-center p-3 rounded-lg gap-3 bg-white/5 hover:bg-white/10 transition-colors relative"
                onMouseEnter={() => setHoveredArtistId(artist.id)}
                onMouseLeave={() => setHoveredArtistId(null)}
              >
                {/* Artist image */}
                <div className="flex-shrink-0 relative">
                  <div className="w-14 h-14 rounded-full overflow-hidden">
                    {artist.images && artist.images.length > 0 ? (
                      <img
                        src={artist.images[0].url}
                        alt={artist.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#333] flex items-center justify-center">
                        <span className="text-sm">🎵</span>
                      </div>
                    )}
                  </div>

                  {/* Play button overlay with dominant color */}
                  {hoveredArtistId === artist.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                      <Button
                        size="icon"
                        className="w-7 h-7 rounded-full hover:scale-110 p-0 transition-transform"
                        style={{ backgroundColor: dominantColor }}
                      >
                        <Play size={14} className="fill-black ml-px" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Artist info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-white truncate">
                      {artist.name}
                    </h4>

                    {/* Match strength indicator with dynamic color */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`flex items-center text-xs`}
                            style={{ color: matchStrength.color }}
                          >
                            <BadgeCheck size={14} className="mr-0.5" />
                            <span className="hidden sm:inline">
                              {matchStrength.label}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#282828] border-none text-white">
                          <div className="p-1">
                            <p className="font-medium mb-1">
                              Similarity score: {score.toFixed(0)}
                            </p>
                            <ul className="text-xs space-y-1">
                              {matchReasons.map((reason, idx) => (
                                <li key={idx} className="flex items-center">
                                  <span
                                    className="w-1.5 h-1.5 rounded-full mr-1.5"
                                    style={{ backgroundColor: dominantColor }}
                                  ></span>
                                  {reason}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {/* Genre pill with dominant color background */}
                    {artist.genres && artist.genres.length > 0 && (
                      <Badge
                        variant="outline"
                        className="border-none text-white/80 text-xs"
                        style={{ backgroundColor: `${dominantColor}22` }}
                      >
                        {artist.genres[0].replace(/-/g, " ")}
                      </Badge>
                    )}

                    {/* Popularity pill */}
                    <Badge className="bg-white/5 text-white/80 border-white/20 text-xs">
                      Popularity: {artist.popularity}
                    </Badge>
                  </div>
                </div>

                {/* Followers */}
                <div className="text-right text-white/80 ml-2 flex-shrink-0">
                  <div className="font-medium">
                    {artist.followers && artist.followers.total >= 1000000
                      ? `${(artist.followers.total / 1000000).toFixed(1)}M`
                      : artist.followers && artist.followers.total >= 1000
                      ? `${(artist.followers.total / 1000).toFixed(1)}K`
                      : artist.followers?.total.toLocaleString() || 0}
                  </div>
                  <span className="text-xs text-white/60">followers</span>
                </div>
              </div>
            </Link>
          );
        })}

        {/* No similar artists found message */}
        {displayedArtists.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="bg-white/5 rounded-full p-3 mb-3">
              <Info size={24} className="text-white/60" />
            </div>
            <h4 className="font-medium mb-1">No similar artists found</h4>
            <p className="text-sm text-white/60 max-w-xs">
              Listen to more music to help us generate better recommendations
            </p>
          </div>
        )}
      </div>

      {/* View all / Show less with dominant color */}
      {similarArtists.length > 10 && (
        <div className="mt-4 text-center">
          <Button
            variant="outline"
            className="text-sm hover:bg-white/10 transition-colors"
            style={{
              borderColor: `${dominantColor}66`,
              color: dominantColor,
            }}
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "Show less" : `View all (${similarArtists.length})`}
          </Button>
        </div>
      )}
    </ScrollArea>
  );
}
