import React from "react";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useChangelog } from "@/app/context/ChangelogContext";

interface ChangelogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangelogModal({ open, onOpenChange }: ChangelogModalProps) {
  const { changelogEntries } = useChangelog();

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "feature":
        return "default";
      case "improvement":
        return "secondary";
      case "fix":
        return "outline";
      default:
        return "outline";
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "feature":
        return "bg-[#1ED760] text-black hover:bg-[#1ED760]/90";
      case "improvement":
        return "bg-[#1DB954] text-white hover:bg-[#1DB954]/90";
      case "fix":
        return "bg-[#F59E0B] text-black hover:bg-[#F59E0B]/90";
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-[#121212] border-none text-white p-0 overflow-hidden">
        <div className="flex items-center justify-between p-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="bg-[#1ED760] rounded-full p-2">
              <Sparkles className="h-5 w-5 text-black" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">What's New</h2>
              <p className="text-sm text-white/60">
                Latest updates and improvements
              </p>
            </div>
          </div>
        </div>

        <ScrollArea className="h-[70vh] px-6 pb-6">
          <div className="space-y-8 py-6">
            {changelogEntries.map((entry, index) => (
              <div
                key={entry.version}
                className={cn(
                  "relative rounded-xl p-6 transition-all",
                  index === 0
                    ? "bg-gradient-to-br from-[#1ED760]/10 to-transparent border border-[#1ED760]/20"
                    : "bg-[#282828] hover:bg-[#333333]"
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "p-2 rounded-lg shrink-0",
                      index === 0 ? "bg-[#1ED760]" : "bg-white/10"
                    )}
                  >
                    <entry.icon
                      className={cn(
                        "h-5 w-5",
                        index === 0 ? "text-black" : "text-white"
                      )}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold">
                        v{entry.version}
                      </h3>
                      <Badge
                        variant={getBadgeVariant(entry.type)}
                        className={cn("capitalize", getBadgeColor(entry.type))}
                      >
                        {entry.type}
                      </Badge>
                    </div>

                    <p className="text-sm text-white/60 mb-3">{entry.date}</p>

                    <h4 className="font-medium mb-3">{entry.title}</h4>

                    <ul className="space-y-2">
                      {entry.description.map((desc, descIndex) => (
                        <li
                          key={descIndex}
                          className="flex items-start gap-2 text-sm text-white/80"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-[#1ED760] mt-2 shrink-0" />
                          {desc}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
