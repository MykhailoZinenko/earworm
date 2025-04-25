// src/app/dashboard/page.tsx
"use client";

import { useAuth } from "../context/AuthContext";
import { ActivityOverview } from "@/components/shared/ActivityOverview";
import { TopItems } from "@/components/shared/TopItems";
import { useState } from "react";

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
            <button
              onClick={() => setTimeRange("short_term")}
              className={`px-3 py-1 text-sm rounded-full ${
                timeRange === "short_term"
                  ? "bg-[#1ED760] text-black font-medium"
                  : "bg-[#333] text-white hover:bg-[#444]"
              }`}
            >
              Last 4 Weeks
            </button>
            <button
              onClick={() => setTimeRange("medium_term")}
              className={`px-3 py-1 text-sm rounded-full ${
                timeRange === "medium_term"
                  ? "bg-[#1ED760] text-black font-medium"
                  : "bg-[#333] text-white hover:bg-[#444]"
              }`}
            >
              Last 6 Months
            </button>
            <button
              onClick={() => setTimeRange("long_term")}
              className={`px-3 py-1 text-sm rounded-full ${
                timeRange === "long_term"
                  ? "bg-[#1ED760] text-black font-medium"
                  : "bg-[#333] text-white hover:bg-[#444]"
              }`}
            >
              All Time
            </button>
          </div>
        </div>
        <TopItems timeRange={timeRange} />
      </div>
    </div>
  );
}
