// src/components/shared/ActivityOverview/RecentTracksList.tsx
import Link from "next/link";
import { Clock, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-responsive";

interface RecentTracksListProps {
  tracks: {
    id: string;
    name: string;
    artist: string;
    artistId: string;
    imageUrl: string;
    playedAt: string;
  }[];
}

export function RecentTracksList({ tracks }: RecentTracksListProps) {
  const isMobile = useIsMobile();

  return (
    <div className="bg-[#282828] rounded-lg p-3 md:p-6">
      <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 flex items-center">
        <Clock className="h-5 w-5 mr-2" />
        Recently Played
      </h3>
      <div className="space-y-3 md:space-y-4">
        {tracks.map((track, index) => (
          <RecentTrackItem key={index} track={track} index={index} />
        ))}
      </div>
      <div className="mt-4 text-center">
        <Link
          href="/dashboard/history"
          className="inline-flex items-center text-sm text-[#1ED760] hover:underline"
        >
          {isMobile ? "View history" : "View your full listening history"}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
    </div>
  );
}

interface RecentTrackItemProps {
  track: {
    id: string;
    name: string;
    artist: string;
    artistId: string;
    imageUrl: string;
    playedAt: string;
  };
  index: number;
}

function RecentTrackItem({ track, index }: RecentTrackItemProps) {
  return (
    <div className="flex items-center bg-[#333333] p-2 md:p-3 rounded-md hover:bg-[#3a3a3a] transition-colors">
      <div className="relative flex-shrink-0">
        <img
          src={track.imageUrl || "/placeholder.png"}
          alt={track.name}
          className="w-10 h-10 md:w-12 md:h-12 rounded"
        />
        <div className="absolute -top-2 -right-2 bg-[#1ED760] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {index + 1}
        </div>
      </div>
      <div className="flex-1 min-w-0 ml-3 md:ml-4">
        <Link
          href={`/dashboard/track/${track.id}`}
          className="font-medium text-white truncate block hover:underline text-sm md:text-base"
        >
          {track.name}
        </Link>
        <Link
          href={`/dashboard/artist/${track.artistId}`}
          className="text-xs md:text-sm text-[#B3B3B3] hover:text-[#1ED760] truncate inline-block"
        >
          {track.artist}
        </Link>
      </div>
      <div className="text-xs text-[#B3B3B3] ml-2 md:ml-4 text-right whitespace-nowrap">
        {new Date(track.playedAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </div>
  );
}
