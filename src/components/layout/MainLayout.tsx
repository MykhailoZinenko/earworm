// src/components/layout/MainLayout.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, SearchCode, Menu } from "lucide-react";
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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

  // Render navigation items for both sidebar and mobile nav
  const renderNavItems = () => (
    <ul className="space-y-1">
      {navItems.map((item) => (
        <li key={item.href}>
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
  );

  return (
    <div className="flex flex-col h-screen bg-background text-foreground md:flex-row">
      {/* Mobile Header */}
      <header className="h-16 flex items-center justify-between px-4 bg-[#121212] md:hidden">
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

        {/* Mobile Menu Button - uses shadcn Sheet component for slide-out menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6 text-white" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[250px] p-0 bg-[#121212]">
            {/* Logo in sidebar */}
            <div className="h-16 flex items-center px-4">
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

            {/* Nav items in sidebar */}
            <div className="mt-4 px-2">{renderNavItems()}</div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-60 md:flex-col bg-[#121212] h-screen">
        {/* Logo container */}
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

        <nav className="mt-4 px-2 flex-1 overflow-y-auto">
          {renderNavItems()}
        </nav>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#121212] md:ml-1 md:my-1 rounded-lg">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-4 md:px-6">
          {/* Search bar */}
          <div className="w-full md:w-3/5 relative">
            <SearchInput />
          </div>

          {/* Profile - hidden on smaller screens, shown on medium+ */}
          <div className="hidden md:flex items-center ml-4">
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
        <main className="flex-1 overflow-auto bg-gradient-to-b from-[#1E1E1E] to-[#121212] rounded-t-2xl md:rounded-2xl pb-16 md:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#121212] border-t border-[#282828] md:hidden z-10">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-1/4 py-2",
                item.active ? "text-[#1ED760]" : "text-[#B3B3B3]"
              )}
            >
              {React.cloneElement(item.icon, {
                className: cn(
                  "h-6 w-6 mb-1",
                  item.active ? "text-[#1ED760]" : "text-[#B3B3B3]"
                ),
              })}
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}

          {/* User profile in the mobile nav */}
          {currentSession && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex flex-col items-center justify-center w-1/4 py-2 h-auto gap-0"
                >
                  <Avatar className="h-6 w-6 border border-[#282828] mb-1">
                    {currentSession.user.images &&
                    currentSession.user.images[0] ? (
                      <AvatarImage
                        src={currentSession.user.images[0].url}
                        alt={currentSession.user.display_name || ""}
                      />
                    ) : null}
                    <AvatarFallback className="bg-[#535353] text-white text-xs">
                      {currentSession.user.display_name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-[#B3B3B3]">Profile</span>
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
          )}
        </div>
      </nav>
    </div>
  );
}
