import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  // Directly redirect to Spotify sign-in
  redirect("/api/auth/signin/spotify");
}
