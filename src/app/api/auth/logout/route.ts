import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  await clearSessionCookie();
  const origin = new URL(req.url).origin;
  return NextResponse.redirect(new URL("/", origin));
}
