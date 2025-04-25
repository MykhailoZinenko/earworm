// src/components/shared/TopItems/FeatureTrackCard.tsx
import { Track } from "@spotify/web-api-ts-sdk";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Play, Clock } from "lucide-react";
import Link from "next/link";
import { useIsMobile } from "@/hooks/use-responsive";

interface FeatureTrackCardProps {
  track: Track;
  index: number;
  isHovered: boolean;
  onHoverChange: (id: string | null) => void;
}

export function FeatureTrackCard({
  track,
  index,
  isHovered,
  onHoverChange,
}: FeatureTrackCardProps) {
  const isMobile = useIsMobile();

  return (
    <Card
      key={track.id}
      className="relative overflow-hidden bg-gradient-to-br from-[#333] to-[#1E1E1E] border-none hover:shadow-xl transition-all duration-300"
      onMouseEnter={() => onHoverChange(track.id)}
      onMouseLeave={() => onHoverChange(null)}
    >
      <CardContent className="p-3 md:p-5">
        <div className="flex">
          <div className="relative min-w-[80px] h-[80px] md:min-w-[120px] md:h-[120px] mr-3 md:mr-5">
            <img
              src={track.album.images?.[0]?.url || "/placeholder.png"}
              alt={track.name}
              className="w-full h-full object-cover rounded-md shadow-lg"
            />
            <div
              className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-300 ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            >
              <Button className="bg-[#1ED760] hover:bg-[#1ED760]/90 rounded-full h-8 w-8 md:h-12 md:w-12 p-0">
                <Play size={isMobile ? 16 : 24} className="fill-black" />
              </Button>
            </div>
            <Badge className="absolute top-0 left-0 bg-[#121212]/80 text-white border-none text-xs">
              #{index + 1}
            </Badge>
          </div>

          <div className="flex-1 min-w-0">
            <Link
              href={`/dashboard/track/${track.id}`}
              className="text-base md:text-xl font-bold hover:underline line-clamp-1"
            >
              {track.name}
            </Link>
            <Link
              href={`/dashboard/artist/${track.artists[0].id}`}
              className="text-sm text-[#B3B3B3] hover:text-[#1ED760] transition-colors"
            >
              {track.artists.map((a) => a.name).join(", ")}
            </Link>

            <div className="flex items-center gap-2 mt-3 text-xs md:text-sm">
              <div className="flex items-center text-[#B3B3B3]">
                <Clock size={14} className="mr-1" />
                {Math.floor(track.duration_ms / 60000)}:
                {((track.duration_ms % 60000) / 1000)
                  .toFixed(0)
                  .padStart(2, "0")}
              </div>
              <Separator orientation="vertical" className="h-3 bg-[#B3B3B3]" />
              <div className="text-[#B3B3B3] truncate">{track.album.name}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
