"use client";

import { useAuth } from "./context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { LoginDropdown } from "@/components/shared/LoginDropdown";

export default function Home() {
  const { currentSession, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    console.log(currentSession, isLoading);
    // If already authenticated, redirect to dashboard
    if (!isLoading && currentSession) {
      router.push("/dashboard");
    }
  }, [currentSession, isLoading, router]);

  // Check for error parameter
  const error = searchParams.get("error");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col">
        <h1 className="text-4xl font-bold mb-8">Welcome to Earworm</h1>
        <p className="text-xl mb-8">
          Track your music habits and get personalized recommendations
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
            <p>Error: {error.replace(/_/g, " ")}</p>
          </div>
        )}

        <LoginDropdown />
      </div>
    </main>
  );
}
