"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function Dashboard() {
  const { currentSession, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log(currentSession, isLoading);

    // If not authenticated, redirect to home
    if (!isLoading && !currentSession) {
      router.push("/");
    }
  }, [currentSession, isLoading, router]);

  if (isLoading || !currentSession) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const user = currentSession.user;

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-bold">Earworm</h1>
          <div className="flex items-center gap-4">
            <Button variant="destructive" onClick={() => logout()}>
              Sign Out
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-6">
              {user.images && user.images[0] ? (
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={user.images[0].url}
                    alt={user.display_name || "User"}
                  />
                  <AvatarFallback>
                    {user.display_name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Avatar className="h-24 w-24">
                  <AvatarFallback>
                    {user.display_name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
              )}
              <div>
                <p className="text-xl font-medium">
                  {user.display_name || "Spotify User"}
                </p>
                <p className="text-muted-foreground">
                  {user.email || "No email provided"}
                </p>
                {user.country && (
                  <p className="text-muted-foreground">
                    Country: {user.country}
                  </p>
                )}
                {user.product && (
                  <p className="text-muted-foreground">
                    Subscription: {user.product}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
