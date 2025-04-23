"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";

export default function Dashboard() {
  const { session, status, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not authenticated, redirect to home
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const spotifyUser = session?.user as any;

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="max-w-4xl w-full">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-bold">Earworm Dashboard</h1>
          <button
            onClick={() => signOut()}
            className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            Sign Out
          </button>
        </div>

        {spotifyUser && (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">User Profile</h2>
            <div className="flex items-center space-x-6">
              {spotifyUser.images && spotifyUser.images[0] && (
                <div className="relative h-24 w-24 rounded-full overflow-hidden">
                  <Image
                    src={spotifyUser.images[0].url}
                    alt={spotifyUser.display_name || "User"}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <p className="text-xl font-medium">
                  {spotifyUser.display_name || "Spotify User"}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  {spotifyUser.email || "No email provided"}
                </p>
                {spotifyUser.country && (
                  <p className="text-gray-600 dark:text-gray-300">
                    Country: {spotifyUser.country}
                  </p>
                )}
                {spotifyUser.product && (
                  <p className="text-gray-600 dark:text-gray-300">
                    Subscription: {spotifyUser.product}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Your Top Artists</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Coming soon! We'll show your most listened artists here.
            </p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Your Top Tracks</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Coming soon! We'll show your most played tracks here.
            </p>
          </div>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Coming soon! We'll show your recent listening activity here.
          </p>
        </div>
      </div>
    </main>
  );
}
