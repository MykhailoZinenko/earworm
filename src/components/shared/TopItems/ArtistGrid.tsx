import { Artist } from "@spotify/web-api-ts-sdk";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";

interface ArtistGridProps {
  artists: Artist[];
  selectedArtistId?: string;
  hoveredItemId: string | null;
  onSelectArtist: (artist: Artist) => void;
  onHoverChange: (id: string | null) => void;
  followingStatus: Record<string, boolean>;
  onToggleFollow: (artistId: string) => void;
  followingLoading: Record<string, boolean>;
}

export function ArtistGrid({
  artists,
  selectedArtistId,
  hoveredItemId,
  onSelectArtist,
  onHoverChange,
  followingStatus,
  onToggleFollow,
  followingLoading,
}: ArtistGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 p-2 md:p-4">
      {artists.map((artist, index) => (
        <Card
          key={artist.id}
          className={`relative group overflow-hidden border-none cursor-pointer transition-all duration-300 py-0 ${
            selectedArtistId === artist.id ? "ring-2 ring-[#1ED760]" : ""
          } ${hoveredItemId === artist.id ? "scale-105" : "scale-100"}`}
          onMouseEnter={() => onHoverChange(artist.id)}
          onMouseLeave={() => onHoverChange(null)}
        >
          <div onClick={() => onSelectArtist(artist)}>
            <Badge className="absolute top-2 left-2 z-10 bg-black/60 text-white rounded-full w-5 h-5 md:w-6 md:h-6 p-0 flex items-center justify-center font-bold text-xs">
              {index + 1}
            </Badge>

            {artist.images && artist.images.length > 0 ? (
              <img
                src={artist.images[0].url}
                alt={artist.name}
                className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full aspect-square bg-[#333] flex items-center justify-center">
                <span className="text-xl">🎵</span>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-3">
              <h3 className="font-bold text-white line-clamp-1 text-sm md:text-base">
                {artist.name}
              </h3>
              <p className="text-xs text-[#B3B3B3] capitalize">
                {artist.genres?.slice(0, 2).join(", ") || "No genres"}
              </p>
            </div>
          </div>

          {/* Follow/Unfollow button */}
          <div className="absolute top-2 right-2 z-10">
            <Button
              size="icon"
              variant="secondary"
              className={`w-8 h-8 rounded-full transition-all ${
                followingStatus[artist.id]
                  ? "bg-[#1ED760] hover:bg-[#1ED760]/90 text-black"
                  : "bg-black/60 hover:bg-black/80 text-white"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFollow(artist.id);
              }}
              disabled={followingLoading[artist.id]}
            >
              {followingLoading[artist.id] ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Heart
                  className={`h-4 w-4 ${
                    followingStatus[artist.id] ? "fill-current" : ""
                  }`}
                />
              )}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
