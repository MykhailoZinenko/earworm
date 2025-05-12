"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/context/AuthContext";
import { LogIn } from "lucide-react";

export function LoginDropdown() {
  const { isLoading, login } = useAuth();

  return (
    <Button
      size="lg"
      disabled={isLoading}
      className="flex items-center gap-2"
      onClick={login}
    >
      <LogIn className="w-5 h-5" />
      {isLoading ? "Loading..." : "Login with Spotify"}
    </Button>
  );
}
