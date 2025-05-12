"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useIsMobile } from "@/hooks/use-responsive";
import { SearchInput } from "@/components/shared/SearchInput";
import { Sidebar } from "./Sidebar";
import { MobileHeader } from "./MobileHeader";
import { MobileNavBar } from "./MobileNavBar";
import { ProfileDropdown } from "./ProfileDropdown";
import { ChangelogModal } from "./ChangelogModal";
import { useChangelog } from "@/app/context/ChangelogContext";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { isOpen, closeChangelog } = useChangelog();

  const navItems = [
    {
      icon: "home",
      label: "Home",
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      icon: "search",
      label: "Search",
      href: "/dashboard/search",
      active: pathname === "/dashboard/search",
    },
    {
      icon: "history",
      label: "History",
      href: "/dashboard/history",
      active: pathname === "/dashboard/history",
    },
  ];

  return (
    <>
      <div className="flex flex-col h-screen bg-background text-foreground md:flex-row">
        {/* Mobile Header */}
        {isMobile && <MobileHeader navItems={navItems} />}

        {/* Desktop Sidebar */}
        {!isMobile && <Sidebar navItems={navItems} />}

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#121212] md:ml-1 md:my-1 rounded-lg">
          {/* Top bar */}
          <header className="h-16 flex items-center justify-between px-4 md:px-6">
            {/* Search bar */}
            <div className="w-full md:w-3/5 relative">
              <SearchInput />
            </div>

            {/* Profile - hidden on smaller screens, shown on medium+ */}
            {!isMobile && user && (
              <div className="hidden md:flex items-center ml-4">
                <ProfileDropdown user={user} />
              </div>
            )}
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-auto bg-gradient-to-b from-[#1E1E1E] to-[#121212] rounded-t-2xl md:rounded-2xl pb-16 md:pb-0">
            {children}
          </main>
        </div>

        {/* Mobile Navigation Bar */}
        {isMobile && <MobileNavBar navItems={navItems} currentSession={user} />}
      </div>

      {/* Changelog Modal */}
      <ChangelogModal
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeChangelog();
          }
        }}
      />
    </>
  );
}
