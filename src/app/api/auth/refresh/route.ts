import { NextRequest, NextResponse } from "next/server";
import { refreshAccessToken } from "@/lib/spotify-auth";

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from request body
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token is required" },
        { status: 400 }
      );
    }

    // Refresh the access token
    const clientId = process.env.SPOTIFY_CLIENT_ID || "";
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET || "";

    const tokenResponse = await refreshAccessToken(
      refreshToken,
      clientId,
      clientSecret
    );

    // Calculate expiration time
    const expiresAt = Date.now() + tokenResponse.expires_in * 1000;

    // Return the new token data
    return NextResponse.json({
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token || refreshToken, // Use the new refresh token if provided
      expiresAt: expiresAt,
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { error: "Failed to refresh token" },
      { status: 500 }
    );
  }
}
