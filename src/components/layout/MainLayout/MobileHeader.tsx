// src/components/layout/MainLayout/MobileHeader.tsx
// Updated to use NavLinks directly
import React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NavLinks } from "./NavLinks";

interface MobileHeaderProps {
  navItems: Array<{
    icon: string;
    label: string;
    href: string;
    active: boolean;
  }>;
}

export function MobileHeader({ navItems }: MobileHeaderProps) {
  return (
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
          {/* Logo in mobile menu */}
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

          {/* Nav links in mobile menu - not hidden */}
          <nav className="mt-4 px-2">
            <NavLinks navItems={navItems} />
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
