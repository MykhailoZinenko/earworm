"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Sparkles, Rocket, Zap, CodeIcon, Hammer } from "lucide-react";

const CURRENT_VERSION = "0.5.1";
const CHANGELOG_VERSION_KEY = "earworm_last_viewed_changelog";

type ChangelogEntry = {
  version: string;
  date: string;
  type: "feature" | "improvement" | "fix";
  title: string;
  description: string[];
  icon: React.ComponentType<{ className?: string }>;
};

export const changelogEntries: ChangelogEntry[] = [
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

interface ChangelogContextType {
  isNewVersion: boolean;
  isOpen: boolean;
  openChangelog: () => void;
  closeChangelog: () => void;
  markChangelogAsViewed: () => void;
  currentVersion: string;
  changelogEntries: ChangelogEntry[];
}

const ChangelogContext = createContext<ChangelogContextType>({
  isNewVersion: false,
  isOpen: false,
  openChangelog: () => {},
  closeChangelog: () => {},
  markChangelogAsViewed: () => {},
  currentVersion: CURRENT_VERSION,
  changelogEntries: changelogEntries,
});

export function ChangelogProvider({ children }: { children: React.ReactNode }) {
  const [isNewVersion, setIsNewVersion] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if this is a new version
    const lastViewedVersion = localStorage.getItem(CHANGELOG_VERSION_KEY);

    if (lastViewedVersion !== CURRENT_VERSION) {
      setIsNewVersion(true);
    }
  }, []);

  const markChangelogAsViewed = useCallback(() => {
    localStorage.setItem(CHANGELOG_VERSION_KEY, CURRENT_VERSION);
    setIsNewVersion(false);
  }, []);

  const openChangelog = useCallback(() => {
    setIsOpen(true);
    markChangelogAsViewed();
  }, [markChangelogAsViewed]);

  const closeChangelog = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <ChangelogContext.Provider
      value={{
        isNewVersion,
        isOpen,
        openChangelog,
        closeChangelog,
        markChangelogAsViewed,
        currentVersion: CURRENT_VERSION,
        changelogEntries,
      }}
    >
      {children}
    </ChangelogContext.Provider>
  );
}

export function useChangelog() {
  return useContext(ChangelogContext);
}
