// src/components/layout/MainLayout/NavLinks.tsx
// Create a new component for just the navigation links
import React from "react";
import Link from "next/link";
import { History, Home, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: string;
  label: string;
  href: string;
  active: boolean;
}

interface NavLinksProps {
  navItems: NavItem[];
}

export function NavLinks({ navItems }: NavLinksProps) {
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
        return <Search className={className} />;
      case "history":
        return <History className={className} />;
      default:
        return <Home className={className} />;
    }
  };

  return (
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
  );
}
