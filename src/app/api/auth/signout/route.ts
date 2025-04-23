import { NextResponse } from "next/server";

export async function POST() {
  // Just return success, the client will handle the actual sign out
  return NextResponse.json({ success: true });
}
