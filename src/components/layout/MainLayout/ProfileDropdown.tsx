// src/components/layout/MainLayout/ProfileDropdown.tsx
import { SpotifyUser } from "@/lib/spotify-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/app/context/AuthContext";

interface ProfileDropdownProps {
  user: SpotifyUser;
}

export function ProfileDropdown({ user }: ProfileDropdownProps) {
  const { logout } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-10 w-10 p-0 hover:bg-[#282828] cursor-pointer"
        >
          <Avatar className="h-10 w-10 border border-[#282828]">
            {user.images && user.images[0] ? (
              <AvatarImage
                src={user.images[0].url}
                alt={user.display_name || ""}
              />
            ) : null}
            <AvatarFallback className="bg-[#535353] text-white">
              {user.display_name?.[0] || "U"}
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
  );
}
