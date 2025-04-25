// src/app/dashboard/artist/[id]/components/LoadingView.tsx
export function LoadingView() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#333] to-[#121212] flex flex-col items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-t-[#1ED760] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        <p className="mt-6 text-[#B3B3B3] text-lg">Loading artist...</p>
      </div>
    </div>
  );
}
