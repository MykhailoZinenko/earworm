import React from "react";
import Link from "next/link";
import { NavLinks } from "./NavLinks";
import { ChangelogButton } from "./ChangelogButton";

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
        <NavLinks navItems={navItems} />
      </nav>

      {/* Changelog Button at the bottom */}
      <div className="px-2 pb-4">
        <ChangelogButton />
      </div>
    </div>
  );
}
