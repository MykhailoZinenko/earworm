import { Artist } from "@spotify/web-api-ts-sdk";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PlusCircle, Play, ExternalLink, Heart, Loader2 } from "lucide-react";
import Link from "next/link";

interface ArtistDetailProps {
  artist: Artist;
  isMobile: boolean;
  isFollowing: boolean;
  onToggleFollow: () => void;
  isFollowLoading: boolean;
}

export function ArtistDetail({
  artist,
  isMobile,
  isFollowing,
  onToggleFollow,
  isFollowLoading,
}: ArtistDetailProps) {
  // Background style helper
  const getArtistBackgroundStyle = (artist: Artist) => {
    if (!artist.images || artist.images.length === 0) {
      return {};
    }

    return {
      backgroundImage: `linear-gradient(to bottom, rgba(18, 18, 18, 0.7), rgba(18, 18, 18, 1)), url(${artist.images[0].url})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  };

  if (isMobile) {
    // Mobile version
    return (
      <Card
        className="relative overflow-hidden border-none transition-colors duration-500 h-[250px]"
        style={getArtistBackgroundStyle(artist)}
      >
        <div className="absolute inset-0 p-4 flex flex-col">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-1">{artist.name}</h2>
            <Badge
              variant="secondary"
              className="bg-[#1ED760] text-black border-none"
            >
              {artist.followers?.total.toLocaleString()} followers
            </Badge>

            {/* Compact genre list */}
            {artist.genres && artist.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {artist.genres.slice(0, 3).map((genre) => (
                  <Badge
                    key={genre}
                    variant="outline"
                    className="bg-white/10 border-none capitalize text-xs"
                  >
                    {genre.replace(/-/g, " ")}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="mt-auto">
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                size="sm"
                className="bg-[#1ED760] hover:bg-[#1ED760]/90 text-black"
              >
                <Play size={16} className="fill-black mr-1" /> Play
              </Button>
              <Button
                size="sm"
                variant="outline"
                className={`border-white/30 hover:border-white ${
                  isFollowing
                    ? "bg-[#1ED760]/20 border-[#1ED760] text-[#1ED760]"
                    : ""
                }`}
                onClick={onToggleFollow}
                disabled={isFollowLoading}
              >
                {isFollowLoading ? (
                  <Loader2 size={16} className="mr-1 animate-spin" />
                ) : (
                  <Heart
                    size={16}
                    className={`mr-1 ${isFollowing ? "fill-current" : ""}`}
                  />
                )}
                {isFollowing ? "Following" : "Follow"}
              </Button>
              <Button size="sm" variant="ghost" className="ml-auto" asChild>
                <Link href={`/dashboard/artist/${artist.id}`}>
                  <ExternalLink size={16} />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Desktop version
  return (
    <Card
      className="h-[500px] relative overflow-hidden border-none transition-colors duration-500"
      style={getArtistBackgroundStyle(artist)}
    >
      <div className="absolute inset-0 p-6 flex flex-col">
        <div className="flex-1">
          <div className="flex justify-between items-start mb-4">
            <Badge variant="outline" className="bg-black/30 border-none">
              ARTIST SPOTLIGHT
            </Badge>
            <Link
              href={`/dashboard/artist/${artist.id}`}
              className="bg-black/30 p-2 rounded-full hover:bg-black/50 transition-colors"
            >
              <ExternalLink size={14} />
            </Link>
          </div>

          <div className="mt-auto">
            <h2 className="text-3xl font-bold mb-1">{artist.name}</h2>
            <Badge
              variant="secondary"
              className="bg-[#1ED760] text-black border-none"
            >
              {artist.followers?.total.toLocaleString()} followers
            </Badge>

            {artist.genres && artist.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 mb-4">
                {artist.genres.slice(0, 4).map((genre) => (
                  <Badge
                    key={genre}
                    variant="outline"
                    className="bg-white/10 border-none capitalize"
                  >
                    {genre.replace(/-/g, " ")}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto">
          <div className="flex flex-wrap items-center gap-3">
            <Button className="bg-[#1ED760] hover:bg-[#1ED760]/90 text-black">
              <Play size={18} className="fill-black mr-2" /> Play Top Songs
            </Button>
            <Button
              variant="outline"
              className={`border-white/30 hover:border-white ${
                isFollowing
                  ? "bg-[#1ED760]/20 border-[#1ED760] text-[#1ED760]"
                  : ""
              }`}
              onClick={onToggleFollow}
              disabled={isFollowLoading}
            >
              {isFollowLoading ? (
                <Loader2 size={18} className="mr-2 animate-spin" />
              ) : (
                <Heart
                  size={18}
                  className={`mr-2 ${isFollowing ? "fill-current" : ""}`}
                />
              )}
              {isFollowing ? "Following" : "Follow"}
            </Button>
          </div>

          <div className="mt-4 text-sm text-[#B3B3B3]">
            Popularity score:
            <Progress value={artist.popularity} className="h-1.5 mt-1" />
          </div>
        </div>
      </div>
    </Card>
  );
}
