"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, SearchCode } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { SearchInput } from "../shared/SearchInput";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const { currentSession, logout } = useAuth();

  const navItems = [
    {
      icon: <Home className="h-5 w-5" />,
      label: "Home",
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      icon: <SearchCode className="h-5 w-5" />,
      label: "Search",
      href: "/dashboard/search",
      active: pathname === "/dashboard/search",
    },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <div className="w-60 flex flex-col bg-[#121212]">
        {/* Logo container - matched height with topbar */}
        <div className="h-16 flex items-center px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="bg-[#1ED760] rounded-full p-1.5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z"
                  fill="#1ED760"
                />
                <path
                  d="M6.5 10.5C10.5 8.5 15.5 9 18 10.5M7 13.5C10 12 14 12.5 17 14"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">Earworm</span>
          </Link>
        </div>

        <nav className="mt-4 px-2">
          <ul>
            {navItems.map((item) => (
              <li key={item.href} className="mb-1">
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 rounded-md text-sm font-medium transition-colors cursor-pointer",
                    item.active
                      ? "text-[#1ED760]"
                      : "text-[#B3B3B3] hover:text-white hover:bg-[#282828]"
                  )}
                >
                  {React.cloneElement(item.icon, {
                    className: cn(
                      "h-6 w-6",
                      item.active ? "text-[#1ED760]" : "text-[#B3B3B3]"
                    ),
                  })}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#121212] ml-1 my-1 rounded-lg">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-6">
          {/* Search bar */}
          <div className="w-3/5 relative">
            <SearchInput />
          </div>

          {/* Profile */}
          <div className="flex items-center">
            {currentSession ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-10 w-10 p-0 hover:bg-[#282828] cursor-pointer"
                  >
                    <Avatar className="h-10 w-10 border border-[#282828]">
                      {currentSession.user.images &&
                      currentSession.user.images[0] ? (
                        <AvatarImage
                          src={currentSession.user.images[0].url}
                          alt={currentSession.user.display_name || ""}
                        />
                      ) : null}
                      <AvatarFallback className="bg-[#535353] text-white">
                        {currentSession.user.display_name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-[#282828] border-none text-white min-w-[200px]"
                >
                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="hover:bg-opacity-80 hover:text-[#1ED760] cursor-pointer focus:bg-opacity-80 focus:text-[#1ED760]"
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Avatar className="h-10 w-10 border border-[#282828]">
                <AvatarFallback className="bg-[#535353] text-white">
                  U
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-gradient-to-b from-[#1E1E1E] to-[#121212] rounded-2xl">
          {children}
        </main>
      </div>
    </div>
  );
}
