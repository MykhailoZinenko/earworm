import React, { useState } from "react";
import { Info, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChangelogModal } from "./ChangelogModal";
import { useChangelog } from "@/hooks/use-changelog";
import { cn } from "@/lib/utils";

export function ChangelogButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { isNewVersion, markChangelogAsViewed } = useChangelog();

  const handleOpen = () => {
    setIsOpen(true);
    markChangelogAsViewed();
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        variant={"ghost"}
        className={cn(
          "w-full flex items-center justify-start gap-4 px-4! py-3! rounded-md text-sm! font-medium transition-colors cursor-pointer h-auto",
          "text-[#B3B3B3] hover:text-white hover:bg-[#282828]"
        )}
      >
        {isNewVersion && (
          <Sparkles className="absolute top-1 right-1 text-[#1ED760] h-3.5 w-3.5 animate-pulse" />
        )}
        <Info className="h-5! w-5!" />
        Changelog
      </Button>
      <ChangelogModal
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) markChangelogAsViewed();
        }}
      />
    </>
  );
}
