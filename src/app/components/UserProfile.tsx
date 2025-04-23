"use client";

import Image from "next/image";
import { useAuth } from "../context/AuthContext";

interface UserProfileProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function UserProfile({ user }: UserProfileProps) {
  const { signOut } = useAuth();

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <div className="flex items-center gap-4">
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name || "User"}
            width={80}
            height={80}
            className="rounded-full"
          />
        ) : (
          <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center text-2xl">
            {user.name?.[0] || "?"}
          </div>
        )}

        <div>
          <h2 className="text-2xl font-bold">{user.name || "Spotify User"}</h2>
          {user.email && <p className="text-gray-400">{user.email}</p>}
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={signOut}
          className="text-sm text-gray-400 hover:text-white"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
