// src/components/layout/MainLayout/Sidebar.tsx
import React from "react";
import Link from "next/link";
import { Home, SearchCode } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: string;
  label: string;
  href: string;
  active: boolean;
}

interface SidebarProps {
  navItems: NavItem[];
}

export function Sidebar({ navItems }: SidebarProps) {
  // Function to render the appropriate icon
  const renderIcon = (iconName: string, isActive: boolean) => {
    const className = cn(
      "h-6 w-6",
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
                {renderIcon(item.icon, item.active)}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
