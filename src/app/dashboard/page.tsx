"use client";

import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { currentSession } = useAuth();

  if (!currentSession) return null;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">
        Hello, {currentSession.user.display_name || "there"}!
      </h1>
    </div>
  );
}
