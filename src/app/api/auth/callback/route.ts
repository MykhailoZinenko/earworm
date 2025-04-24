import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens, getUserProfile } from "@/lib/spotify-auth";

export async function GET(request: NextRequest) {
  try {
    // Get the query parameters from the request URL
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    console.log("Callback received with code:", code ? "Present" : "Missing");
    console.log("Callback state:", state ? "Present" : "Missing");

    // Handle errors from Spotify
    if (error) {
      console.error("Spotify returned error:", error);
      return NextResponse.redirect(new URL(`/?error=${error}`, request.url));
    }

    // Validate required parameters
    if (!code || !state) {
      console.error("Missing required parameters");
      return NextResponse.redirect(
        new URL("/?error=missing_parameters", request.url)
      );
    }

    // Use the EXACT same redirect URI that was used to initiate the flow
    // This must match what's registered in Spotify's developer dashboard
    const redirectUri = process.env.AUTH_URL + "/api/auth/callback";
    const clientId = process.env.SPOTIFY_CLIENT_ID || "";
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET || "";

    console.log("Using redirect URI:", redirectUri);

    try {
      // Get tokens from Spotify
      const tokenResponse = await exchangeCodeForTokens(
        code,
        clientId,
        clientSecret,
        redirectUri
      );

      // Get user profile data
      const userProfile = await getUserProfile(tokenResponse.access_token);

      // Calculate token expiration time
      const expiresAt = Date.now() + tokenResponse.expires_in * 1000;

      // Create session data
      const sessionData = {
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        expiresAt,
        user: userProfile,
      };

      // Encode the session data as a URL-safe string
      const encodedSession = Buffer.from(JSON.stringify(sessionData)).toString(
        "base64"
      );

      // Redirect to the auth-handler page with the session data
      return NextResponse.redirect(
        new URL(`/auth-handler?session=${encodedSession}`, request.url)
      );
    } catch (tokenError) {
      console.error("Token exchange error:", tokenError);
      return NextResponse.redirect(
        new URL("/?error=token_exchange_failed", request.url)
      );
    }
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.redirect(
      new URL("/?error=authentication_failed", request.url)
    );
  }
}
