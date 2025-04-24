"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/app/context/AuthContext";
import { PlusCircle, LogIn, UserX } from "lucide-react";

export function LoginDropdown() {
  const { isLoading, allSessions, login, loginWithSession, removeUserAccount } =
    useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="lg"
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <LogIn className="w-5 h-5" />
          {isLoading ? "Loading..." : "Login with Spotify"}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72">
        {allSessions.length > 0 && (
          <>
            <div className="px-2 py-1.5 text-sm font-medium">
              Previous accounts
            </div>

            {allSessions.map((session) => (
              <DropdownMenuItem
                key={session.user.id}
                className="flex items-center gap-3 p-2 cursor-pointer"
                onClick={() => loginWithSession(session.user.id)}
              >
                <Avatar className="h-8 w-8">
                  {session.user.images && session.user.images[0] ? (
                    <AvatarImage
                      src={session.user.images[0].url}
                      alt={session.user.display_name}
                    />
                  ) : null}
                  <AvatarFallback>
                    {session.user.display_name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium truncate">
                    {session.user.display_name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session.user.email}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeUserAccount(session.user.id);
                  }}
                >
                  <UserX className="h-4 w-4" />
                </Button>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => login(true)}
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add new account</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
