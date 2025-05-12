"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { Models } from "appwrite";
import { account } from "@/lib/appwrite/config";
import {
  getCurrentUser,
  saveSpotifyUserToDB,
  getUserSettings,
  updateUserSettings,
  createOAuth2Session,
  signOutAccount,
} from "@/lib/appwrite/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User, Settings } from "@/types";

interface AuthContextType {
  user: User | null;
  settings: Settings | null;
  spotifyClient: SpotifyApi | null;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  settings: null,
  spotifyClient: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
  updateSettings: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [spotifyClient, setSpotifyClient] = useState<SpotifyApi | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const session = await account.getSession("current");

      if (session) {
        // Get user from database
        const { data: userDoc, error: userError } = await getCurrentUser();

        if (userError || !userDoc) {
          // User doesn't exist, create from Spotify data
          const { data: newUser } = await saveSpotifyUserToDB();
          if (newUser) {
            setUser(newUser as User);
            // Get settings for new user
            const { data: settingsDoc } = await getUserSettings(newUser.$id);
            if (settingsDoc) {
              setSettings(settingsDoc as Settings);
            }
          }
        } else {
          setUser(userDoc as User);
          // Get user settings
          const { data: settingsDoc } = await getUserSettings(userDoc.$id);
          if (settingsDoc) {
            setSettings(settingsDoc as Settings);
          }
        }

        // Initialize Spotify client
        const spotifyClient = await createSpotifyClient(session);
        setSpotifyClient(spotifyClient);
      }
    } catch (error) {
      console.error("Session check failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createSpotifyClient = async (session: Models.Session) => {
    const providerToken = session.providerAccessToken;

    if (!providerToken) {
      throw new Error("No Spotify access token found");
    }

    const client = SpotifyApi.withAccessToken(
      process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!,
      {
        access_token: providerToken,
        token_type: "Bearer",
        expires_in: 3600,
        refresh_token: session.providerRefreshToken || "",
      }
    );

    return client;
  };

  const login = async () => {
    try {
      const { error } = await createOAuth2Session();
      if (error) {
        toast.error(error.message);
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Failed to login with Spotify");
    }
  };

  const logout = async () => {
    try {
      const { error } = await signOutAccount();
      if (error) {
        toast.error(error.message);
      } else {
        setUser(null);
        setSettings(null);
        setSpotifyClient(null);
        router.push("/");
      }
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to logout");
    }
  };

  const updateSettings = async (updates: Partial<Settings>) => {
    if (!settings) return;

    try {
      const { data: updatedSettings, error } = await updateUserSettings(
        settings.$id,
        updates
      );

      if (error) {
        toast.error(error.message);
      } else if (updatedSettings) {
        setSettings(updatedSettings as Settings);
        toast.success("Settings updated successfully");
      }
    } catch (error) {
      console.error("Failed to update settings:", error);
      toast.error("Failed to update settings");
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        settings,
        spotifyClient,
        isLoading,
        login,
        logout,
        updateSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
