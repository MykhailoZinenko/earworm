import React, { useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Rocket, Zap, CodeIcon, Hammer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChangelogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const changelogEntries = [
  {
    version: "0.5.1",
    date: "May 15, 2024",
    type: "fix",
    title: "Bug Fixes",
    description: [
      "Fixed namings and responsiveness of UI",
      "Resolved some minor code bugs",
    ],
    icon: Hammer,
  },
  {
    version: "0.5.0",
    date: "May 15, 2024",
    type: "feature",
    title: "Artist Deep Dive Experience",
    description: [
      "Introduced comprehensive artist profile pages with detailed listening insights",
      "Added personalized artist recommendations based on listening history",
      "Implemented advanced temporal and genre-based artist similarity algorithm",
    ],
    icon: Rocket,
  },
  {
    version: "0.4.2",
    date: "April 22, 2024",
    type: "improvement",
    title: "Enhanced Search and Navigation",
    description: [
      "Completely revamped search functionality with more intuitive results",
      "Added recent searches and smart discovery suggestions",
      "Improved mobile responsiveness of search input",
    ],
    icon: Zap,
  },
  {
    version: "0.4.0",
    date: "March 30, 2024",
    type: "feature",
    title: "Multi-Account Support",
    description: [
      "Implemented secure multi-account Spotify login",
      "Added ability to switch between different Spotify accounts",
      "Enhanced authentication flow with improved token management",
    ],
    icon: CodeIcon,
  },
  {
    version: "0.3.0",
    date: "February 15, 2024",
    type: "feature",
    title: "Top Items and Activity Overview",
    description: [
      "Added comprehensive top artists and tracks section",
      "Created detailed activity overview with listening statistics",
      "Implemented time-range filtering for top items",
    ],
    icon: Sparkles,
  },
  {
    version: "0.2.0",
    date: "January 10, 2024",
    type: "feature",
    title: "Initial Dashboard Launch",
    description: [
      "First version of Earworm dashboard",
      "Basic Spotify authentication",
      "Initial UI design and core functionality implemented",
    ],
    icon: Sparkles,
  },
];

export function ChangelogModal({ open, onOpenChange }: ChangelogModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeVersion, setActiveVersion] = useState(
    changelogEntries[0].version
  );

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "feature":
        return "default";
      case "improvement":
        return "secondary";
      default:
        return "outline";
    }
  };

  const scrollToVersion = (version: string) => {
    const element = document.getElementById(`changelog-entry-${version}`);
    if (element && contentRef.current) {
      const offset = element.offsetTop - contentRef.current.offsetTop - 32;
      contentRef.current.children[1].scrollTo({
        top: offset,
        behavior: "smooth",
      });
      setActiveVersion(version);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl min-w-[80vw] bg-[#282828] border-none text-white p-0 overflow-hidden @container">
        <div className="grid @3xl:grid-cols-[300px_1fr] h-[80vh] max-h-[800px]">
          <div className="hidden @3xl:block bg-black/20 p-6 border-r border-white/10">
            <h2 className="text-2xl font-bold text-[#1ED760] mb-4">Earworm</h2>
            <p className="text-white/60 mb-6">Changelog</p>
            <div className="space-y-2">
              {changelogEntries.map((entry) => (
                <Button
                  key={entry.version}
                  variant={"link"}
                  onClick={() => scrollToVersion(entry.version)}
                  className={`w-full text-left flex justify-start items-center gap-3 px-2 py-1 rounded 
                    ${
                      activeVersion === entry.version
                        ? "text-[#1ED760] bg-white/10"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    } transition-colors`}
                >
                  <entry.icon className="h-4 w-4" />
                  <span className="text-sm">v{entry.version}</span>
                </Button>
              ))}
            </div>
          </div>
          <ScrollArea
            ref={contentRef as React.RefObject<HTMLDivElement>}
            className="p-6 @3xl:p-8 h-full max-h-[800px]"
          >
            <div className="space-y-8">
              {changelogEntries.map((entry, index) => (
                <div
                  id={`changelog-entry-${entry.version}`}
                  key={entry.version}
                  className={`relative p-6 rounded-lg bg-black/20 border-l-4 ${
                    index === 0
                      ? "border-[#1ED760]"
                      : "border-transparent hover:border-white/30 transition-all"
                  }`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <entry.icon
                        className={`h-6 w-6 ${
                          activeVersion === entry.version
                            ? "text-[#1ED760]"
                            : "text-white/60"
                        }`}
                      />
                      <h3 className="text-xl font-semibold">
                        v{entry.version}
                      </h3>
                    </div>
                    <Badge
                      variant={getBadgeVariant(entry.type)}
                      className="capitalize text-xs"
                    >
                      {entry.type}
                    </Badge>
                  </div>
                  <p className="text-white/60 mb-2">{entry.date}</p>
                  <h4 className="font-medium text-[#1ED760] mb-3 text-lg">
                    {entry.title}
                  </h4>
                  <ul className="list-disc list-inside text-white/80 space-y-2 pl-2">
                    {entry.description.map((desc, descIndex) => (
                      <li
                        key={descIndex}
                        className="relative pl-2 before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-[#1ED760] before:rounded-full"
                      >
                        {desc}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
