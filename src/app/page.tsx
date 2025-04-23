"use client";

import { useAuth } from "./context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { signIn, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col">
        <h1 className="text-4xl font-bold mb-8">Welcome to Earworm</h1>
        <p className="text-xl mb-8">
          Track your music habits and get personalized recommendations
        </p>

        <button
          onClick={() => signIn()}
          className="px-6 py-3 rounded-md bg-green-500 text-white font-medium hover:bg-green-600 transition-colors"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Loading..." : "Login with Spotify"}
        </button>
      </div>
    </main>
  );
}
