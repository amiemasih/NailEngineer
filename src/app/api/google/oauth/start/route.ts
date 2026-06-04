import { NextResponse } from "next/server";
import { assertTechSession } from "@/lib/tech-session-server";
import { getAuthUrl, oauthConfigured } from "@/lib/google-calendar";

export const runtime = "nodejs";

/** Tech-only: kick off the Google OAuth consent flow. */
export async function GET(req: Request) {
  await assertTechSession();

  if (!oauthConfigured()) {
    const url = new URL("/tech/dashboard?google=not_configured", req.url);
    return NextResponse.redirect(url);
  }

  const authUrl = getAuthUrl();
  if (!authUrl) {
    const url = new URL("/tech/dashboard?google=error", req.url);
    return NextResponse.redirect(url);
  }
  return NextResponse.redirect(authUrl);
}
