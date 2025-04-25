// src/hooks/use-changelog.ts
import { useState, useEffect } from "react";

const CURRENT_VERSION = "0.5.1";
const CHANGELOG_VERSION_KEY = "earworm_last_viewed_changelog";

export function useChangelog() {
  const [isNewVersion, setIsNewVersion] = useState(false);

  useEffect(() => {
    // Check if this is a new version
    const lastViewedVersion = localStorage.getItem(CHANGELOG_VERSION_KEY);

    if (lastViewedVersion !== CURRENT_VERSION) {
      setIsNewVersion(true);
    }
  }, []);

  const markChangelogAsViewed = () => {
    localStorage.setItem(CHANGELOG_VERSION_KEY, CURRENT_VERSION);
    setIsNewVersion(false);
  };

  return {
    isNewVersion,
    markChangelogAsViewed,
    currentVersion: CURRENT_VERSION,
  };
}
