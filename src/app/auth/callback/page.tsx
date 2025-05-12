"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Appwrite handles the OAuth flow automatically
    // Just redirect to dashboard
    setTimeout(() => router.push("/dashboard"), 1000);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Authenticating...</h2>
        <p>Please wait while we complete your login.</p>
      </div>
    </div>
  );
}
