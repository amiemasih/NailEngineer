import { NextResponse } from "next/server";
import { assertTechSession } from "@/lib/tech-session-server";
import { exchangeCodeAndStore } from "@/lib/google-calendar";

export const runtime = "nodejs";

/** Tech-only: Google redirects here with ?code= after consent. */
export async function GET(req: Request) {
  await assertTechSession();

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const oauthError = searchParams.get("error");

  if (oauthError || !code) {
    return NextResponse.redirect(new URL("/tech/dashboard?google=denied", req.url));
  }

  try {
    const result = await exchangeCodeAndStore(code);
    if (!result.stored) {
      const reason = result.reason === "no_refresh_token" ? "no_refresh" : "error";
      return NextResponse.redirect(
        new URL(`/tech/dashboard?google=${reason}`, req.url),
      );
    }
    return NextResponse.redirect(new URL("/tech/dashboard?google=connected", req.url));
  } catch {
    return NextResponse.redirect(new URL("/tech/dashboard?google=error", req.url));
  }
}
