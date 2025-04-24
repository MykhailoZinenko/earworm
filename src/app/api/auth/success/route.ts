import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get the session parameter
    const searchParams = request.nextUrl.searchParams;
    const sessionParam = searchParams.get("session");

    if (!sessionParam) {
      return NextResponse.redirect(
        new URL("/?error=missing_session_data", request.url)
      );
    }

    // Instead of processing here, redirect to frontend with the session data
    // This way, the client-side code can handle storing the session
    return NextResponse.redirect(
      new URL(`/auth-handler?session=${sessionParam}`, request.url)
    );
  } catch (error) {
    console.error("Session processing error:", error);
    return NextResponse.redirect(
      new URL("/?error=session_processing_failed", request.url)
    );
  }
}
