// Spotify OAuth utilities
export interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  images: { url: string; height: number; width: number }[];
  product: string;
  country: string;
  uri: string;
}

export interface AuthSession {
  user: SpotifyUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// Constants for auth
const SPOTIFY_ACCOUNTS_BASE_URL = "https://accounts.spotify.com";
const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1";

// Scopes needed for our application
const SCOPES = [
  "ugc-image-upload",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "app-remote-control",
  "streaming",
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-public",
  "playlist-modify-private",
  "user-library-modify",
  "user-library-read",
  "user-top-read",
  "user-read-playback-position",
  "user-read-recently-played",
  "user-follow-read",
  "user-follow-modify",
  "user-read-email",
  "user-read-private",
];

// Generate a random string for state validation
export function generateRandomString(length: number): string {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let text = "";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

// Generate the Spotify authorization URL
export function getAuthorizationUrl(
  clientId: string,
  redirectUri: string,
  forceLogin: boolean = false
): string {
  // Generate a random state value for CSRF protection
  const state = generateRandomString(16);

  // Store the state for verification when Spotify redirects back
  if (typeof window !== "undefined") {
    localStorage.setItem("spotify_auth_state", state);
  }

  // Build the authorization URL
  const authUrl = new URL(`${SPOTIFY_ACCOUNTS_BASE_URL}/authorize`);

  // Add required parameters
  authUrl.searchParams.append("client_id", clientId);
  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append("redirect_uri", redirectUri);
  authUrl.searchParams.append("state", state);
  authUrl.searchParams.append("scope", SCOPES.join(" "));

  console.log("Generated auth URL:", authUrl.toString());

  // Add optional parameters for forcing login
  if (forceLogin) {
    authUrl.searchParams.append("show_dialog", "true");
  }

  return authUrl.toString();
}

// Exchange the authorization code for tokens
export async function exchangeCodeForTokens(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<SpotifyTokenResponse> {
  try {
    const tokenUrl = `${SPOTIFY_ACCOUNTS_BASE_URL}/api/token`;

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${clientId}:${clientSecret}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.error_description || "Failed to exchange code for tokens"
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error exchanging code for tokens:", error);
    throw error;
  }
}

// Refresh an expired access token
export async function refreshAccessToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<SpotifyTokenResponse> {
  try {
    const tokenUrl = `${SPOTIFY_ACCOUNTS_BASE_URL}/api/token`;

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${clientId}:${clientSecret}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.error_description || "Failed to refresh access token"
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error refreshing access token:", error);
    throw error;
  }
}

// Get the user's Spotify profile
export async function getUserProfile(
  accessToken: string
): Promise<SpotifyUser> {
  try {
    const response = await fetch(`${SPOTIFY_API_BASE_URL}/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to fetch user profile");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
}

// Store user session in localStorage
// Store user session in localStorage
export function storeUserSession(session: AuthSession): void {
  if (typeof window === "undefined") return;

  try {
    // Get existing sessions array
    const sessionsStr = localStorage.getItem("spotify_sessions");
    const sessions: AuthSession[] = sessionsStr ? JSON.parse(sessionsStr) : [];

    // Check if session for this user already exists
    const existingSessionIndex = sessions.findIndex(
      (s) => s.user.id === session.user.id
    );

    if (existingSessionIndex >= 0) {
      // Update existing session
      sessions[existingSessionIndex] = session;
    } else {
      // Add new session
      sessions.push(session);
    }

    // Store updated sessions
    localStorage.setItem("spotify_sessions", JSON.stringify(sessions));

    // Set as current session
    localStorage.setItem("spotify_current_session", session.user.id);

    // Also set a cookie that the middleware can check (expires in 30 days)
    document.cookie = `spotify_current_session=${
      session.user.id
    }; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
  } catch (error) {
    console.error("Error storing user session:", error);
  }
}

// Clear all sessions (logout all accounts)
export function clearAllSessions(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem("spotify_sessions");
  localStorage.removeItem("spotify_current_session");
  localStorage.removeItem("spotify_auth_state");

  // Also clear the cookie
  document.cookie = "spotify_current_session=; path=/; max-age=0; SameSite=Lax";
}

// Remove a session
export function removeSession(userId: string): void {
  if (typeof window === "undefined") return;

  try {
    const sessions = getAllSessions().filter((s) => s.user.id !== userId);
    localStorage.setItem("spotify_sessions", JSON.stringify(sessions));

    // If we removed the current session, clear the current session or set to first available
    const currentSessionId = localStorage.getItem("spotify_current_session");
    if (currentSessionId === userId) {
      if (sessions.length > 0) {
        localStorage.setItem("spotify_current_session", sessions[0].user.id);
        // Update cookie
        document.cookie = `spotify_current_session=${
          sessions[0].user.id
        }; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
      } else {
        localStorage.removeItem("spotify_current_session");
        // Clear cookie
        document.cookie =
          "spotify_current_session=; path=/; max-age=0; SameSite=Lax";
      }
    }
  } catch (error) {
    console.error("Error removing session:", error);
  }
}

// Get all stored user sessions
export function getAllSessions(): AuthSession[] {
  if (typeof window === "undefined") return [];

  try {
    const sessionsStr = localStorage.getItem("spotify_sessions");
    return sessionsStr ? JSON.parse(sessionsStr) : [];
  } catch (error) {
    console.error("Error retrieving sessions:", error);
    return [];
  }
}

// Get current active session
export function getCurrentSession(): AuthSession | null {
  if (typeof window === "undefined") return null;

  try {
    const currentSessionId = localStorage.getItem("spotify_current_session");
    if (!currentSessionId) return null;

    const sessions = getAllSessions();
    return sessions.find((s) => s.user.id === currentSessionId) || null;
  } catch (error) {
    console.error("Error retrieving current session:", error);
    return null;
  }
}

// Set current active session
export function setCurrentSession(userId: string): void {
  if (typeof window === "undefined") return;

  localStorage.setItem("spotify_current_session", userId);

  // Also update the cookie
  document.cookie = `spotify_current_session=${userId}; path=/; max-age=${
    30 * 24 * 60 * 60
  }; SameSite=Lax`;
}

// Check if user is authenticated (for client-side use)
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;

  const currentSessionId = localStorage.getItem("spotify_current_session");
  return !!currentSessionId;
}

// Check if session is expired
export function isSessionExpired(session: AuthSession): boolean {
  return Date.now() > session.expiresAt;
}
