import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);

  // Return session data (or empty object if not authenticated)
  return NextResponse.json(session || { user: null });
}
