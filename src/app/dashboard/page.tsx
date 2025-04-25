// src/app/dashboard/page.tsx - updated with shadcn Badge components
"use client";

import { useAuth } from "../context/AuthContext";
import { ActivityOverview } from "@/components/shared/ActivityOverview";
import { TopItems } from "@/components/shared/TopItems";
import { useState } from "react";
import { Badge } from "@/components/ui/badge"; // Import shadcn Badge

export default function Dashboard() {
  const { currentSession } = useAuth();
  const [timeRange, setTimeRange] = useState<
    "short_term" | "medium_term" | "long_term"
  >("short_term");

  if (!currentSession) return null;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">
        Hello, {currentSession.user.display_name || "there"}!
      </h1>

      {/* Activity Overview */}
      <div className="mb-10">
        <ActivityOverview />
      </div>

      {/* Enhanced Top Items */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Your Music</h2>
          <div className="flex gap-2">
            {/* Replace custom buttons with shadcn Badges */}
            <Badge
              onClick={() => setTimeRange("short_term")}
              variant={timeRange === "short_term" ? "default" : "secondary"}
              className={`cursor-pointer py-1.5 px-3 hover:opacity-90 ${
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
              className={`cursor-pointer py-1.5 px-3 hover:opacity-90 ${
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
              className={`cursor-pointer py-1.5 px-3 hover:opacity-90 ${
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
