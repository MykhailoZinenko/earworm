"use client";

import { AuthProvider } from "./context/AuthContext";
import { ChangelogProvider } from "./context/ChangelogContext";
import { SearchProvider } from "./context/SearchContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SearchProvider>
        <ChangelogProvider>{children}</ChangelogProvider>
      </SearchProvider>
    </AuthProvider>
  );
}
