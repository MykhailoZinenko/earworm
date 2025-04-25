// src/app/context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import {
  AuthSession,
  getAllSessions,
  getCurrentSession,
  setCurrentSession,
  removeSession,
  storeUserSession,
  isSessionExpired,
} from "@/lib/spotify-auth";
import { useRouter } from "next/navigation";

interface AuthContextType {
  isLoading: boolean;
  currentSession: AuthSession | null;
  allSessions: AuthSession[];
  spotifyClient: SpotifyApi | null;
  login: (forceNewAccount?: boolean) => void;
  loginWithSession: (userId: string) => void;
  logout: () => void;
  removeUserAccount: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  currentSession: null,
  allSessions: [],
  spotifyClient: null,
  login: () => {},
  loginWithSession: () => {},
  logout: () => {},
  removeUserAccount: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [currentSession, setCurrentSessionState] = useState<AuthSession | null>(
    null
  );
  const [allSessions, setAllSessions] = useState<AuthSession[]>([]);
  const [spotifyClient, setSpotifyClient] = useState<SpotifyApi | null>(null);
  const router = useRouter();

  // Initialize Spotify client when session changes
  useEffect(() => {
    if (currentSession?.accessToken) {
      try {
        console.log(process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID);
        // We don't need to provide client ID on the client side when using withAccessToken
        const client = SpotifyApi.withAccessToken(
          process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || "",
          {
            access_token: currentSession.accessToken,
            token_type: "Bearer",
            expires_in: Math.floor(
              (currentSession.expiresAt - Date.now()) / 1000
            ),
            refresh_token: currentSession.refreshToken,
          }
        );
        console.log("in auth context", client);
        setSpotifyClient(client);
        console.log("Spotify client initialized", client);
      } catch (error) {
        console.error("Error initializing Spotify client:", error);
        setSpotifyClient(null);
      }
    } else {
      setSpotifyClient(null);
    }
  }, [currentSession]);

  // Load sessions from localStorage on component mount
  useEffect(() => {
    const initAuth = () => {
      try {
        const current = getCurrentSession();
        const all = getAllSessions();

        setCurrentSessionState(current);
        setAllSessions(all);
        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing auth:", error);
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Function to refresh an expired token
  const refreshToken = async (session: AuthSession) => {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken: session.refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to refresh token");
      }

      const data = await response.json();

      // Update the session with the new tokens
      const updatedSession: AuthSession = {
        ...session,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken || session.refreshToken,
        expiresAt: data.expiresAt,
      };

      // Store the updated session
      storeUserSession(updatedSession);

      // Update state
      setCurrentSessionState(updatedSession);
      setAllSessions(getAllSessions());

      return updatedSession;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return null;
    }
  };

  // Periodically check if the current session's token is expired and refresh it
  useEffect(() => {
    if (!currentSession) return;

    const checkTokenExpiration = async () => {
      if (isSessionExpired(currentSession)) {
        console.log("Token expired, refreshing...");
        await refreshToken(currentSession);
      }
    };

    // Check immediately
    checkTokenExpiration();

    // Then check every minute
    const interval = setInterval(checkTokenExpiration, 60000);

    return () => clearInterval(interval);
  }, [currentSession]);

  // Redirect to login page
  const login = (forceNewAccount = false) => {
    const forceParam = forceNewAccount ? "?force_login=true" : "";
    window.location.href = `/api/auth/login${forceParam}`;
  };

  // Switch to another session
  const loginWithSession = (userId: string) => {
    const session = allSessions.find((s) => s.user.id === userId);

    if (!session) {
      console.error("Session not found for user ID:", userId);
      return;
    }

    // If token is expired, refresh it first
    if (isSessionExpired(session)) {
      refreshToken(session).then((updatedSession) => {
        if (updatedSession) {
          setCurrentSession(userId);
          setCurrentSessionState(updatedSession);
          router.push("/dashboard");
        } else {
          // If refresh failed, remove the session and redirect to login
          removeSession(userId);
          setAllSessions(getAllSessions());
          login();
        }
      });
    } else {
      // If token is valid, just set the current session
      setCurrentSession(userId);
      setCurrentSessionState(session);
      router.push("/dashboard");
    }
  };

  // Logout (clear current session)
  const logout = () => {
    if (currentSession) {
      setCurrentSessionState(null);
      setSpotifyClient(null);

      // Clear current session ID from localStorage
      setCurrentSession("");

      // Clear the auth cookie
      document.cookie =
        "spotify_current_session=; path=/; max-age=0; SameSite=Lax";

      router.push("/");
    }
  };

  // Remove an account
  const removeUserAccount = (userId: string) => {
    removeSession(userId);
    setAllSessions(getAllSessions());

    // If we removed the current session, update the current session state
    if (currentSession && currentSession.user.id === userId) {
      const newCurrentSession = getCurrentSession();
      setCurrentSessionState(newCurrentSession);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        currentSession,
        allSessions,
        spotifyClient,
        login,
        loginWithSession,
        logout,
        removeUserAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
