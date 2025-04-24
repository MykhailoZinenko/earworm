"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { SpotifyProfile } from "@auth/core/providers/spotify";

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

  const spotifyUser = session?.user as SpotifyProfile;

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-bold">Earworm</h1>
          <div className="flex items-center gap-4">
            <Button variant="destructive" onClick={() => signOut()}>
              Sign Out
            </Button>
          </div>
        </div>

        {spotifyUser && (
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-6">
                {spotifyUser.images && spotifyUser.images[0] ? (
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={spotifyUser.images[0].url}
                      alt={spotifyUser.display_name || "User"}
                    />
                    <AvatarFallback>
                      {spotifyUser.display_name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <Avatar className="h-24 w-24">
                    <AvatarFallback>
                      {spotifyUser.display_name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div>
                  <p className="text-xl font-medium">
                    {spotifyUser.display_name || "Spotify User"}
                  </p>
                  <p className="text-muted-foreground">
                    {spotifyUser.email || "No email provided"}
                  </p>
                  {spotifyUser.country && (
                    <p className="text-muted-foreground">
                      Country: {spotifyUser.country}
                    </p>
                  )}
                  {spotifyUser.product && (
                    <p className="text-muted-foreground">
                      Subscription: {spotifyUser.product}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
