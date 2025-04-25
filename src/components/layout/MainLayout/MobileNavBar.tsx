// src/components/layout/MainLayout/MobileNavBar.tsx
import React from "react";
import Link from "next/link";
import { Home, SearchCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthSession } from "@/lib/spotify-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/context/AuthContext";

interface MobileNavBarProps {
  navItems: Array<{
    icon: string;
    label: string;
    href: string;
    active: boolean;
  }>;
  currentSession: AuthSession | null;
}

export function MobileNavBar({ navItems, currentSession }: MobileNavBarProps) {
  const { logout } = useAuth();

  // Function to render the appropriate icon
  const renderIcon = (iconName: string, isActive: boolean) => {
    const className = cn(
      "h-6 w-6 mb-1",
      isActive ? "text-[#1ED760]" : "text-[#B3B3B3]"
    );

    switch (iconName) {
      case "home":
        return <Home className={className} />;
      case "search":
        return <SearchCode className={className} />;
      default:
        return <Home className={className} />;
    }
  };

  return (
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
            {renderIcon(item.icon, item.active)}
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}

        {/* User profile in the mobile nav */}
        {currentSession && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex flex-col items-center justify-center w-1/4 py-2 px-0 h-auto gap-0"
              >
                <Avatar className="h-6 w-6 border border-[#282828]">
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
                <span className="text-xs text-[#B3B3B3] mt-1">Profile</span>
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
  );
}
