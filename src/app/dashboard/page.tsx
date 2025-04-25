// src/app/dashboard/page.tsx
"use client";

import { useAuth } from "../context/AuthContext";
import { ActivityOverview } from "@/components/shared/ActivityOverview";
import { TopItems } from "@/components/shared/TopItems";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { currentSession } = useAuth();
  const [timeRange, setTimeRange] = useState<
    "short_term" | "medium_term" | "long_term"
  >("short_term");

  if (!currentSession) return null;

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8">
        Hello, {currentSession.user.display_name || "there"}!
      </h1>

      {/* Activity Overview */}
      <div className="mb-6 md:mb-10">
        <ActivityOverview />
      </div>

      {/* Enhanced Top Items */}
      <div className="mb-6 md:mb-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 sm:gap-0 mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold">Your Music</h2>
          <div className="flex flex-wrap gap-2 w-full px-3 sm:w-auto sm:px-0">
            <Badge
              onClick={() => setTimeRange("short_term")}
              variant={timeRange === "short_term" ? "default" : "secondary"}
              className={`flex-1 cursor-pointer py-1.5 px-3 hover:opacity-90 ${
                timeRange === "short_term"
                  ? "bg-[#1ED760] text-black hover:bg-[#1ED760]/90"
                  : "bg-[#333] text-white hover:bg-[#444]"
              }`}
            >
              Last 4 Weeks
            </Badge>
            <Badge
              onClick={() => setTimeRange("medium_term")}
              variant={timeRange === "medium_term" ? "default" : "secondary"}
              className={`flex-1 cursor-pointer py-1.5 px-3 hover:opacity-90 ${
                timeRange === "medium_term"
                  ? "bg-[#1ED760] text-black hover:bg-[#1ED760]/90"
                  : "bg-[#333] text-white hover:bg-[#444]"
              }`}
            >
              Last 6 Months
            </Badge>
            <Badge
              onClick={() => setTimeRange("long_term")}
              variant={timeRange === "long_term" ? "default" : "secondary"}
              className={`flex-1 cursor-pointer py-1.5 px-3 hover:opacity-90 ${
                timeRange === "long_term"
                  ? "bg-[#1ED760] text-black hover:bg-[#1ED760]/90"
                  : "bg-[#333] text-white hover:bg-[#444]"
              }`}
            >
              All Time
            </Badge>
          </div>
        </div>
        <TopItems timeRange={timeRange} />
      </div>
    </div>
  );
}
