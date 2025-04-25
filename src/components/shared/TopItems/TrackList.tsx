// src/components/shared/TopItems/TrackList.tsx
import { Track } from "@spotify/web-api-ts-sdk";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Play, Clock } from "lucide-react";
import Link from "next/link";

interface TrackListProps {
  tracks: Track[];
  startIndex: number;
  hoveredItemId: string | null;
  onHoverChange: (id: string | null) => void;
}

export function TrackList({
  tracks,
  startIndex,
  hoveredItemId,
  onHoverChange,
}: TrackListProps) {
  return (
    <Table>
      <TableHeader className="bg-[#232323]">
        <TableRow>
          <TableHead className="w-[60px] text-[#B3B3B3]">#</TableHead>
          <TableHead className="text-[#B3B3B3]">Track</TableHead>
          <TableHead className="text-[#B3B3B3]">Album</TableHead>
          <TableHead className="flex justify-center items-center text-[#B3B3B3]">
            <Clock size={16} />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tracks.map((track, index) => (
          <TableRow
            key={track.id}
            className={`border-b border-[#333] hover:bg-white/5 ${
              hoveredItemId === track.id ? "bg-white/5" : ""
            }`}
            onMouseEnter={() => onHoverChange(track.id)}
            onMouseLeave={() => onHoverChange(null)}
          >
            <TableCell className="text-[#B3B3B3]">
              {index + startIndex + 1}
            </TableCell>
            <TableCell>
              <div className="flex items-center">
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
                <div>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Link
                        href={`/dashboard/track/${track.id}`}
                        className="font-medium hover:underline"
                      >
                        {track.name}
                      </Link>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80 bg-[#282828] border-none">
                      <div className="flex">
                        <img
                          src={
                            track.album.images?.[0]?.url || "/placeholder.png"
                          }
                          alt={track.name}
                          className="w-16 h-16 object-cover rounded mr-3"
                        />
                        <div>
                          <h4 className="font-bold">{track.name}</h4>
                          <p className="text-sm text-[#B3B3B3]">
                            {track.artists.map((a) => a.name).join(", ")}
                          </p>
                          <p className="text-xs text-[#B3B3B3] mt-1">
                            {track.album.name} •{" "}
                            {track.album.release_date?.split("-")[0]}
                          </p>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                  <div>
                    <Link
                      href={`/dashboard/artist/${track.artists[0].id}`}
                      className="text-sm text-[#B3B3B3] hover:text-[#1ED760] transition-colors"
                    >
                      {track.artists.map((a) => a.name).join(", ")}
                    </Link>
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell className="text-[#B3B3B3]">
              <span className="line-clamp-1">{track.album.name}</span>
            </TableCell>
            <TableCell className="text-center text-[#B3B3B3]">
              {Math.floor(track.duration_ms / 60000)}:
              {((track.duration_ms % 60000) / 1000).toFixed(0).padStart(2, "0")}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
