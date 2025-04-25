// src/components/shared/TopItems/TrackListMobile.tsx
import { Track } from "@spotify/web-api-ts-sdk";
import { Play } from "lucide-react";
import Link from "next/link";

interface TrackListMobileProps {
  tracks: Track[];
  startIndex: number;
  hoveredItemId: string | null;
  onHoverChange: (id: string | null) => void;
}

export function TrackListMobile({
  tracks,
  startIndex,
  hoveredItemId,
  onHoverChange,
}: TrackListMobileProps) {
  return (
    <>
      {tracks.map((track, index) => (
        <div
          key={track.id}
          className={`bg-[#1E1E1E] rounded-lg p-3 ${
            hoveredItemId === track.id ? "bg-[#282828]" : ""
          }`}
          onMouseEnter={() => onHoverChange(track.id)}
          onMouseLeave={() => onHoverChange(null)}
        >
          <div className="flex items-center">
            <div className="text-[#B3B3B3] w-6 text-center text-sm">
              {index + startIndex + 1}
            </div>
            <div className="relative w-10 h-10 mr-3 flex-shrink-0">
              <img
                src={track.album.images?.[0]?.url || "/placeholder.png"}
                alt={track.name}
                className="w-full h-full object-cover rounded"
              />
              {hoveredItemId === track.id && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Play size={16} className="fill-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <Link
                href={`/dashboard/track/${track.id}`}
                className="font-medium text-sm hover:underline line-clamp-1"
              >
                {track.name}
              </Link>
              <Link
                href={`/dashboard/artist/${track.artists[0].id}`}
                className="text-xs text-[#B3B3B3] hover:text-[#1ED760] transition-colors line-clamp-1"
              >
                {track.artists.map((a) => a.name).join(", ")}
              </Link>
            </div>
            <div className="text-right text-xs text-[#B3B3B3] ml-2">
              {Math.floor(track.duration_ms / 60000)}:
              {((track.duration_ms % 60000) / 1000).toFixed(0).padStart(2, "0")}
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
