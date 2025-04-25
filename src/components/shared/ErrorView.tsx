// src/app/dashboard/artist/[id]/components/ErrorView.tsx
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft } from "lucide-react";

interface ErrorViewProps {
  error: string;
  onBack: () => void;
}

export function ErrorView({ error, onBack }: ErrorViewProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#333] to-[#121212] flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center max-w-md text-center">
        <AlertTriangle size={48} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-[#B3B3B3] mb-6">{error}</p>
        <Button onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft size={18} />
          Go Back
        </Button>
      </div>
    </div>
  );
}
