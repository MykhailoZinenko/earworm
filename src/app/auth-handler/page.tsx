// Modify src/app/auth-handler/page.tsx

"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { storeUserSession, AuthSession } from "@/lib/spotify-auth";
import { useAuth } from "../context/AuthContext";

function AuthHandlerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshAuthState } = useAuth();

  useEffect(() => {
    // Process the authentication data
    const processAuth = async () => {
      try {
        // Get the session data from URL parameters
        const sessionParam = searchParams.get("session");

        if (!sessionParam) {
          throw new Error("No session data provided");
        }

        // Decode the session data
        const sessionData: AuthSession = JSON.parse(
          Buffer.from(sessionParam, "base64").toString()
        );

        // Store the session data
        storeUserSession(sessionData);

        refreshAuthState();

        router.push("/dashboard");
      } catch (error) {
        console.error("Error processing authentication:", error);
        router.push("/?error=auth_processing_failed");
      }
    };

    processAuth();
  }, [router, searchParams, refreshAuthState]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center text-sm flex flex-col">
        <h1 className="text-2xl font-bold mb-6">Authentication Successful</h1>
        <p className="text-lg mb-4">Processing your login...</p>
      </div>
    </main>
  );
}

export default function AuthHandlerPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthHandlerContent />
    </Suspense>
  );
}
