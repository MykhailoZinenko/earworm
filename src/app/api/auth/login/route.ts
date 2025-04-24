import { NextRequest, NextResponse } from "next/server";
import { getAuthorizationUrl } from "@/lib/spotify-auth";

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const forceLogin = searchParams.get("force_login") === "true";

    // Use the EXACT same redirect URI that will be used in the callback
    // This must match what's registered in Spotify's developer dashboard
    const redirectUri = process.env.AUTH_URL + "/api/auth/callback";
    const clientId = process.env.SPOTIFY_CLIENT_ID || "";

    console.log("Using redirect URI for login:", redirectUri);

    const authUrl = getAuthorizationUrl(clientId, redirectUri, forceLogin);

    // Redirect the user to Spotify's authorization page
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.redirect(new URL("/?error=login_failed", request.url));
  }
}
