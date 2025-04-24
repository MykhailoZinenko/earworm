import NextAuth, { AuthOptions } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import { JWT } from "next-auth/jwt";
import { SpotifyProfile } from "next-auth/providers/spotify";
import { Account, Profile, Session } from "next-auth";
import { AdapterUser } from "next-auth/adapters";

const scopes = [
  "user-read-email",
  "user-read-private",
  "user-top-read",
  "user-read-recently-played",
  "playlist-read-private",
  "playlist-modify-public",
  "playlist-modify-private",
].join(" ");

interface ExtendedJWT extends JWT {
  accessToken: string;
  accessTokenExpires: number;
  refreshToken: string;
  user?: SpotifyProfile;
  error?: string;
}

interface ExtendedSession extends Session {
  accessToken: string;
  error?: string;
}

async function sessionCallback(
  params:
    | { session: Session; token: ExtendedJWT }
    | {
        session: Session;
        token: JWT;
        user: AdapterUser;
        trigger: "update";
        newSession: Session;
      }
): Promise<ExtendedSession> {
  const { session, token } = params as { session: Session; token: ExtendedJWT };

  return {
    ...session,
    user: token.user ?? session.user,
    accessToken: token.accessToken,
    error: token.error,
  };
}

async function refreshAccessToken(token: ExtendedJWT): Promise<ExtendedJWT> {
  try {
    const basicAuth = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString("base64");

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
      cache: "no-store",
    });

    const refreshedTokens = await response.json();

    if (!response.ok) throw refreshedTokens;

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error("Error refreshing access token", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: AuthOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID || "",
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: scopes,
          prompt: "consent",
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === "development",
  callbacks: {
    async jwt({
      token,
      account,
      profile,
    }: {
      token: JWT;
      account?: Account | null;
      profile?: Profile;
    }): Promise<ExtendedJWT> {
      if (account && profile) {
        return {
          ...token,
          accessToken: account.access_token!,
          refreshToken: account.refresh_token!,
          accessTokenExpires: account.expires_at! * 1000,
          user: profile as SpotifyProfile,
        };
      }

      if (Date.now() < (token as ExtendedJWT).accessTokenExpires) {
        return token as ExtendedJWT;
      }

      return refreshAccessToken(token as ExtendedJWT);
    },

    session: sessionCallback,
  },
  pages: {
    signIn: "/",
    signOut: "/",
    error: "/",
    newUser: "/dashboard",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
