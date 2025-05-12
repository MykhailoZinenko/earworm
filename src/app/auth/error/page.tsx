"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function AuthError() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Authentication Failed</h2>
        <p className="text-gray-400 mb-6">
          {error ||
            "An error occurred during authentication. Please try again."}
        </p>
        <Button
          onClick={() => router.push("/")}
          className="bg-[#1ED760] text-black hover:bg-[#1ED760]/90"
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
}
