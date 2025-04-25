// src/components/shared/ActivityOverview/StatCards.tsx
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Headphones, Music, Calendar, Disc, BarChart } from "lucide-react";

interface StatCardsProps {
  stats: {
    count: number;
    uniqueArtists: number;
    topGenres: string[];
    mostActive: {
      day: string;
      count: number;
    };
  };
}

export function StatCards({ stats }: StatCardsProps) {
  return (
    <div className="relative">
      <ScrollArea className="pb-4 w-full">
        <div className="flex space-x-3 md:space-x-4 w-max min-w-full">
          <StatCard
            icon={<Headphones className="h-5 w-5 md:h-6 md:w-6 text-black" />}
            iconBgColor="#1ED760"
            title="Tracks Played"
            value={stats.count.toString()}
            subtitle="in the last 7 days"
          />

          <StatCard
            icon={<Music className="h-5 w-5 md:h-6 md:w-6 text-black" />}
            iconBgColor="#1DB954"
            title="Unique Artists"
            value={stats.uniqueArtists.toString()}
            subtitle="diverse listening"
          />

          <StatCard
            icon={<Calendar className="h-5 w-5 md:h-6 md:w-6 text-black" />}
            iconBgColor="#1AB34D"
            title="Most Active Day"
            value={stats.mostActive.day}
            subtitle={`${stats.mostActive.count} tracks played`}
          />

          <StatCard
            icon={<Disc className="h-5 w-5 md:h-6 md:w-6 text-black" />}
            iconBgColor="#19A945"
            title="Top Genre"
            value={stats.topGenres[0]?.replace(/-/g, " ") || "None"}
            subtitle={
              stats.topGenres.length > 1
                ? `Also: ${stats.topGenres
                    .slice(1, 3)
                    .map((g) => g.replace(/-/g, " "))
                    .join(", ")}`
                : ""
            }
            valueClassName="capitalize truncate max-w-[120px] md:max-w-[160px]"
            subtitleClassName="capitalize truncate max-w-[120px] md:max-w-[160px]"
          />

          <StatCard
            icon={<BarChart className="h-5 w-5 md:h-6 md:w-6 text-black" />}
            iconBgColor="#18A040"
            title="Listening Pattern"
            value={
              stats.count > 20
                ? "Active"
                : stats.count > 10
                ? "Moderate"
                : "Light"
            }
            subtitle="based on recent plays"
          />
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  iconBgColor: string;
  title: string;
  value: string;
  subtitle: string;
  valueClassName?: string;
  subtitleClassName?: string;
}

function StatCard({
  icon,
  iconBgColor,
  title,
  value,
  subtitle,
  valueClassName = "",
  subtitleClassName = "",
}: StatCardProps) {
  return (
    <div className="bg-gradient-to-br from-[#3E3E3E] to-[#282828] p-3 md:p-5 rounded-lg flex items-center min-w-[200px] md:min-w-[240px]">
      <div
        className={`p-2 md:p-3 rounded-full mr-3 md:mr-4`}
        style={{ backgroundColor: iconBgColor }}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs md:text-sm text-[#B3B3B3]">{title}</p>
        <p className={`text-lg md:text-xl font-bold ${valueClassName}`}>
          {value}
        </p>
        <p className={`text-xs text-[#B3B3B3] ${subtitleClassName}`}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}
