// src/components/shared/SearchInput/SearchResultItem.tsx
import { SpotifySearchResult, useSearch } from "@/app/context/SearchContext";
import { useRouter } from "next/navigation";
import { Clock, Music, User, Disc, ListMusic } from "lucide-react";

interface SearchResultItemProps {
  result: SpotifySearchResult;
  isRecent: boolean;
}

export function SearchResultItem({ result, isRecent }: SearchResultItemProps) {
  const router = useRouter();
  const { addToRecentSearches } = useSearch();

  const handleSelectResult = () => {
    addToRecentSearches(result);

    switch (result.type) {
      case "track":
        router.push(`/dashboard/track/${result.id}`);
        break;
      case "artist":
        router.push(`/dashboard/artist/${result.id}`);
        break;
      case "album":
        router.push(`/dashboard/album/${result.id}`);
        break;
      case "playlist":
        router.push(`/dashboard/playlist/${result.id}`);
        break;
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "track":
        return <Music className="h-4 w-4" />;
      case "artist":
        return <User className="h-4 w-4" />;
      case "album":
        return <Disc className="h-4 w-4" />;
      case "playlist":
        return <ListMusic className="h-4 w-4" />;
      default:
        return <Music className="h-4 w-4" />;
    }
  };

  return (
    <button
      className="w-full px-3 py-2 md:px-4 md:py-2 flex items-center gap-2 md:gap-3 hover:bg-[#3E3E3E] text-left"
      onClick={handleSelectResult}
    >
      <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-[#333333] rounded overflow-hidden">
        {result.imageUrl ? (
          <img
            src={result.imageUrl}
            alt={result.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#B3B3B3]">
            {isRecent ? (
              <Clock className="h-4 w-4" />
            ) : (
              getIconForType(result.type)
            )}
          </div>
        )}
      </div>
      <div className="overflow-hidden flex-1">
        <div className="text-white truncate text-sm md:text-base">
          {result.name}
        </div>
        <div className="text-xs text-[#B3B3B3] flex items-center gap-1">
          {getIconForType(result.type)}
          <span className="capitalize">{result.type}</span>
          {result.artist && ` • ${result.artist}`}
        </div>
      </div>
    </button>
  );
}
