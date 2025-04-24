import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // For our custom auth, we'll check for an auth cookie instead of using NextAuth
  // If you want to implement a more secure check, you could create a custom cookie
  // with auth data, but for now we'll just check if the auth-handler was visited
  const authCookie = request.cookies.get("spotify_current_session");

  // Redirect to login if accessing protected routes without the auth cookie
  if (!authCookie && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: ["/dashboard/:path*"],
};
